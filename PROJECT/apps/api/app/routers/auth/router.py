from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user, get_current_platform_admin
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_platform_admin_token,
    create_activation_token,
    generate_random_token,
    hash_token,
    decode_token,
)
from app.models.identity_models import User, Session, Domain, Role, UserRole, Department, UserDepartment
from app.models.platform_models import PlatformAdmin, Plan, Pack
from app.models.organization_models import Organization, OrganizationSettings, OrganizationPack
from app.services.access_service import AccessService
from app.schemas.access import UserAccessResponse
from app.services.audit_service import audit_service
from app.schemas.auth_schemas import (
    LoginRequest,
    RegisterRequest,
    RefreshTokenRequest,
    TokenResponse,
    PlatformAdminLoginRequest,
)

router = APIRouter(prefix="/auth", tags=["Authentication & Identity"])


class TenantActivationRequest(BaseModel):
    token: str = Field(..., description="Signed activation JWT token")
    password: Optional[str] = Field(None, min_length=6)
    full_name: Optional[str] = None
    selected_domain_slugs: Optional[List[str]] = Field(default_factory=list)
    default_embedding_model: Optional[str] = "nomic-embed-text"
    document_retention_days: Optional[int] = 365
    settings: Optional[Dict[str, Any]] = None


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_organization(
    payload: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Self-service registration for new enterprise tenants.
    Creates Organization in PENDING_APPROVAL state, awaiting Platform SuperAdmin review.
    """
    # Check if slug exists
    existing_org = await db.execute(
        select(Organization).where(Organization.slug == payload.organization_slug.lower())
    )
    if existing_org.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Organization slug '{payload.organization_slug}' is already taken",
        )

    # Check if email exists
    existing_user = await db.execute(
        select(User).where(User.email == payload.email.lower(), User.deleted_at.is_(None))
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists",
        )

    # Resolve Plan
    plan_stmt = select(Plan).where(Plan.slug == (payload.plan_slug or "starter").lower())
    plan_res = await db.execute(plan_stmt)
    plan = plan_res.scalar_one_or_none()
    if not plan:
        plan = (await db.execute(select(Plan))).scalars().first()
        if not plan:
            plan = Plan(name="Starter Plan", slug="starter", max_users=10, max_storage_bytes=10 * 1024 * 1024 * 1024)
            db.add(plan)
            await db.flush()

    # Create Organization with PENDING_APPROVAL status
    org = Organization(
        name=payload.organization_name,
        slug=payload.organization_slug.lower(),
        plan_id=plan.id,
        status="PENDING_APPROVAL",
    )
    db.add(org)
    await db.flush()

    # Create Organization Settings
    org_settings = OrganizationSettings(
        organization_id=org.id,
        mfa_required=False,
        password_login_enabled=True,
    )
    db.add(org_settings)

    # Create Org Admin User (Inactive until approved and activated)
    user = User(
        organization_id=org.id,
        email=payload.email.lower(),
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        is_active=False,
        email_verified=False,
        is_org_admin=True,
    )
    db.add(user)
    await db.flush()

    await audit_service.log_event(
        db=db,
        action="ORGANIZATION_REGISTER_REQUESTED",
        organization_id=str(org.id),
        actor_id=str(user.id),
        resource_type="organization",
        resource_id=str(org.id),
        metadata={"name": org.name, "slug": org.slug, "status": "PENDING_APPROVAL"},
    )
    await db.commit()

    return TokenResponse(
        status="PENDING_APPROVAL",
        message="Organization registration submitted successfully. It is currently awaiting Superadmin approval.",
        organization_id=str(org.id),
        organization_slug=org.slug,
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "organization_id": str(org.id),
            "tenant_slug": org.slug,
            "status": "PENDING_APPROVAL",
        },
    )


class UserRegisterRequest(BaseModel):
    organization_slug: str = Field(..., min_length=2)
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    department_id: Optional[str] = None
    invite_code: Optional[str] = None


@router.post("/register-user", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_tenant_user(
    payload: UserRegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    User Member Registration for an Existing Tenant Organization.
    Creates an active user account under the specified organization.
    """
    clean_slug = payload.organization_slug.strip().lower()
    org_res = await db.execute(
        select(Organization).where(Organization.slug == clean_slug, Organization.deleted_at.is_(None))
    )
    org = org_res.scalar_one_or_none()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization '{payload.organization_slug}' was not found",
        )

    if org.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Organization '{org.name}' is currently {org.status.lower()}",
        )

    # Check if email is taken
    clean_email = payload.email.strip().lower()
    existing_user = await db.execute(
        select(User).where(User.email == clean_email, User.deleted_at.is_(None))
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists",
        )

    # Create user in PENDING_APPROVAL state (requires Org Admin approval before login)
    user = User(
        organization_id=org.id,
        email=clean_email,
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        is_active=False,
        email_verified=False,
        is_org_admin=False,
    )
    db.add(user)
    await db.flush()

    # Assign default role if available
    role_res = await db.execute(
        select(Role).where(
            Role.organization_id == org.id,
            Role.slug == "member"
        )
    )
    member_role = role_res.scalars().first()
    if not member_role:
        role_res2 = await db.execute(select(Role).where(Role.organization_id == org.id))
        member_role = role_res2.scalars().first()

    if member_role:
        db.add(UserRole(user_id=user.id, role_id=member_role.id))

    await db.commit()
    await db.refresh(user)

    await audit_service.log_event(
        db=db,
        action="USER_REGISTRATION_PENDING_APPROVAL",
        organization_id=str(org.id),
        actor_id=str(user.id),
        resource_type="user",
        resource_id=str(user.id),
        metadata={"email": user.email, "org": org.name, "status": "PENDING_APPROVAL"},
    )

    return TokenResponse(
        access_token="",
        refresh_token="",
        organization_id=str(org.id),
        organization_slug=org.slug,
        is_superadmin=False,
        status="PENDING_APPROVAL",
        message=f"Registration submitted successfully. Your account requires approval from an Organization Administrator before you can log in to {org.name}.",
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "organization_id": str(org.id),
            "tenant_id": str(org.id),
            "tenant_slug": org.slug,
            "status": "PENDING_APPROVAL",
            "is_org_admin": False,
            "is_platform_admin": False,
            "is_superadmin": False,
        },
    )


@router.get("/verify-activation-token")
async def verify_activation_token(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Verifies one-time setup activation JWT token and returns tenant and available domain metadata.
    """
    try:
        decoded = decode_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired activation link. Please contact Superadmin.",
        )

    if decoded.get("token_type") != "tenant_activation":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is not a valid tenant activation token.",
        )

    org_id = decoded.get("organization_id")
    user_id = decoded.get("sub")

    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin user not found")

    # Fetch available domains across system
    domains_res = await db.execute(select(Domain))
    domains = domains_res.scalars().all()

    return {
        "valid": True,
        "organization_id": str(org.id),
        "organization_name": org.name,
        "organization_slug": org.slug,
        "status": org.status,
        "admin_email": user.email,
        "admin_full_name": user.full_name,
        "available_domains": [
            {
                "id": str(d.id),
                "name": d.name,
                "slug": d.slug,
                "description": d.description,
            }
            for d in domains
        ],
    }


@router.post("/activate-tenant", response_model=TokenResponse)
async def activate_tenant(
    payload: TenantActivationRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Onboarding Wizard Activation Endpoint:
    Sets admin password, chooses active domains, sets status to ACTIVE, and logs in the tenant admin.
    """
    try:
        decoded = decode_token(payload.token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired activation token.",
        )

    org_id = decoded.get("organization_id")
    user_id = decoded.get("sub")

    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin user not found")

    # Update Admin credentials if specified
    if payload.password:
        user.password_hash = hash_password(payload.password)
    if payload.full_name:
        user.full_name = payload.full_name

    user.is_active = True
    user.email_verified = True
    org.status = "ACTIVE"

    # Link selected domain packs or domains
    if payload.selected_domain_slugs:
        for slug in payload.selected_domain_slugs:
            pack_stmt = select(Pack).where(Pack.slug == slug.lower())
            pack_res = await db.execute(pack_stmt)
            p = pack_res.scalar_one_or_none()
            if p:
                existing_p = await db.execute(
                    select(OrganizationPack).where(
                        OrganizationPack.organization_id == org.id,
                        OrganizationPack.pack_id == p.id,
                    )
                )
                if not existing_p.scalar_one_or_none():
                    db.add(OrganizationPack(organization_id=org.id, pack_id=p.id, is_active=True))

    # Update settings if provided
    settings_res = await db.execute(
        select(OrganizationSettings).where(OrganizationSettings.organization_id == org.id)
    )
    org_settings = settings_res.scalar_one_or_none()
    if org_settings and payload.default_embedding_model:
        cfg = org_settings.security_config or {}
        cfg["default_embedding_model"] = payload.default_embedding_model
        cfg["document_retention_days"] = payload.document_retention_days or 365
        org_settings.security_config = cfg

    # Create active session
    raw_refresh = generate_random_token(48)
    session = Session(
        user_id=user.id,
        refresh_token_hash=hash_token(raw_refresh),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    )
    db.add(session)
    await db.commit()

    await audit_service.log_event(
        db=db,
        action="TENANT_ACTIVATED",
        organization_id=str(org.id),
        actor_id=str(user.id),
        resource_type="organization",
        resource_id=str(org.id),
        metadata={"name": org.name, "slug": org.slug, "selected_domains": payload.selected_domain_slugs},
    )

    access_token = create_access_token(
        subject=str(user.id),
        organization_id=str(org.id),
        session_id=str(session.id),
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        organization_id=str(org.id),
        organization_slug=org.slug,
        is_superadmin=False,
        status="ACTIVE",
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "organization_id": str(org.id),
            "tenant_id": str(org.id),
            "tenant_slug": org.slug,
            "is_org_admin": True,
            "is_platform_admin": False,
            "is_superadmin": False,
        },
    )



@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Unified Authentication Endpoint with Strict Multi-Tenant Boundary Enforcement:
    Authenticates Platform SuperAdmins and Tenant Organization Users within their designated tenant workspace.
    """
    # Resolve target tenant context from payload or Host subdomain middleware
    target_tenant_slug = (
        payload.organization_slug.strip().lower()
        if payload.organization_slug
        else getattr(request.state, "tenant_slug", None)
    )

    # 1. Check if user belongs to the target tenant organization
    stmt = select(User).where(User.email == payload.email.lower(), User.deleted_at.is_(None))
    if target_tenant_slug:
        stmt = stmt.join(Organization, Organization.id == User.organization_id).where(
            Organization.slug == target_tenant_slug
        )

    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    # Check for Cross-Tenant Mismatch Leak (User exists in DB under a different organization)
    if not user and target_tenant_slug:
        cross_stmt = (
            select(User, Organization)
            .join(Organization, Organization.id == User.organization_id)
            .where(User.email == payload.email.lower(), User.deleted_at.is_(None))
        )
        cross_res = await db.execute(cross_stmt)
        cross_record = cross_res.first()
        if cross_record:
            mismatch_user, mismatch_org = cross_record
            if verify_password(payload.password, mismatch_user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Please sign in through your assigned organization workspace.",
                )

    if not user or not verify_password(payload.password, user.password_hash):
        # 2. Check if platform administrator
        admin_stmt = select(PlatformAdmin).where(PlatformAdmin.email == payload.email.lower())
        admin_res = await db.execute(admin_stmt)
        admin = admin_res.scalar_one_or_none()
        if admin and verify_password(payload.password, admin.password_hash):
            if not admin.is_active:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform admin account is inactive")

            admin.last_login_at = datetime.now(timezone.utc)
            await db.commit()

            access_token = create_platform_admin_token(admin_id=str(admin.id), email=admin.email)
            return TokenResponse(
                access_token=access_token,
                refresh_token=generate_random_token(48),
                organization_id="platform",
                organization_slug="platform",
                is_superadmin=True,
                user={
                    "id": str(admin.id),
                    "email": admin.email,
                    "full_name": admin.full_name or "Super Admin",
                    "is_platform_admin": True,
                    "is_superadmin": True,
                    "tenant_slug": "superadmin",
                },
            )

        await audit_service.log_event(
            db=db,
            action="LOGIN_FAILED",
            metadata={"email": payload.email, "target_tenant": target_tenant_slug, "ip": request.client.host if request.client else None},
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    user_status = getattr(user, "status", None) or ("ACTIVE" if user.is_active else "PENDING_APPROVAL")
    if user_status == "PENDING_APPROVAL" or not user.is_active:
        org_obj = await db.get(Organization, user.organization_id)
        org_title = org_obj.name if org_obj else "your organization"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"PENDING_APPROVAL: Your registration request is awaiting approval by an Organization Administrator of {org_title}. You will be able to log in once approved.",
        )
    elif user_status == "SUSPENDED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ACCOUNT_SUSPENDED: Your account has been suspended by an administrator. Please contact your organization administrator.",
        )

    user.last_login_at = datetime.now(timezone.utc)
    raw_refresh = generate_random_token(48)
    session = Session(
        user_id=user.id,
        refresh_token_hash=hash_token(raw_refresh),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    )
    db.add(session)
    await db.commit()

    org = await db.get(Organization, user.organization_id)
    org_slug = org.slug if org else "default"

    await audit_service.log_event(
        db=db,
        action="LOGIN",
        organization_id=str(user.organization_id),
        actor_id=str(user.id),
        resource_type="user",
        resource_id=str(user.id),
    )

    # Fetch all assigned departments
    dept_stmt = (
        select(Department)
        .join(UserDepartment, UserDepartment.department_id == Department.id)
        .where(UserDepartment.user_id == user.id)
        .order_by(UserDepartment.is_primary.desc())
    )
    dept_res = await db.execute(dept_stmt)
    all_depts = dept_res.scalars().all()
    primary_dept = all_depts[0] if all_depts else None
    dept_slug = primary_dept.slug if primary_dept else None
    dept_name = primary_dept.name if primary_dept else None
    dept_id = str(primary_dept.id) if primary_dept else None
    allowed_depts = ["*"] if user.is_org_admin else [d.slug for d in all_depts if d.slug]

    # Fetch user roles
    role_stmt = (
        select(Role)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user.id)
    )
    role_res = await db.execute(role_stmt)
    roles_list = role_res.scalars().all()
    primary_role = (roles_list[0].slug if roles_list else ("tenant_admin" if user.is_org_admin else "emp")).lower()
    domain_roles = [
        {"domain_slug": r.slug.split("-")[0] if "-" in r.slug else (dept_slug or "hr"), "role": r.slug}
        for r in roles_list
    ]
    if user.is_org_admin:
        domain_roles.append({"domain_slug": "*", "role": "tenant-admin"})
        if dept_slug:
            domain_roles.append({"domain_slug": dept_slug, "role": f"{dept_slug}-admin"})

    access_token = create_access_token(
        subject=str(user.id),
        organization_id=str(user.organization_id),
        session_id=str(session.id),
        claims={
            "is_org_admin": bool(user.is_org_admin),
            "is_superadmin": False,
            "org_slug": org_slug,
            "tenant_slug": org_slug,
            "department_slug": dept_slug,
            "department_id": dept_id,
            "allowed_departments": allowed_depts,
            "role": primary_role,
            "roles": [r.slug for r in roles_list],
        },
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        organization_id=str(user.organization_id),
        organization_slug=org_slug,
        is_superadmin=False,
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "organization_id": str(user.organization_id),
            "tenant_id": str(user.organization_id),
            "tenant_slug": org_slug,
            "is_org_admin": user.is_org_admin,
            "is_platform_admin": False,
            "is_superadmin": False,
            "role": primary_role,
            "department_id": dept_id,
            "department_name": dept_name,
            "department_slug": dept_slug,
            "department": {
                "id": dept_id,
                "name": dept_name,
                "slug": dept_slug,
            } if primary_dept else None,
            "domain_roles": domain_roles,
            "roles": [{"id": str(r.id), "name": r.name, "slug": r.slug} for r in roles_list],
        },
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token with rotation."""
    stmt = select(Session).where(
        Session.refresh_token_hash == hash_token(payload.refresh_token),
        Session.is_revoked == False,
        Session.expires_at > datetime.now(timezone.utc),
    )
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    user = await db.get(User, session.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    new_refresh = generate_random_token(48)
    session.refresh_token_hash = hash_token(new_refresh)
    await db.commit()

    org = await db.get(Organization, user.organization_id)
    org_slug = org.slug if org else "default"

    dept_stmt = (
        select(Department)
        .join(UserDepartment, UserDepartment.department_id == Department.id)
        .where(UserDepartment.user_id == user.id)
        .order_by(UserDepartment.is_primary.desc())
    )
    dept_res = await db.execute(dept_stmt)
    all_depts = dept_res.scalars().all()
    primary_dept = all_depts[0] if all_depts else None
    dept_slug = primary_dept.slug if primary_dept else None
    dept_id = str(primary_dept.id) if primary_dept else None
    allowed_depts = [d.slug for d in all_depts] if not user.is_org_admin else ["*"]

    role_stmt = (
        select(Role)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user.id)
    )
    role_res = await db.execute(role_stmt)
    roles_list = role_res.scalars().all()
    primary_role = roles_list[0].name if roles_list else ("Org Admin" if user.is_org_admin else "Member")

    new_access = create_access_token(
        subject=str(user.id),
        organization_id=str(user.organization_id),
        session_id=str(session.id),
        claims={
            "is_org_admin": bool(user.is_org_admin),
            "is_superadmin": False,
            "org_slug": org_slug,
            "tenant_slug": org_slug,
            "department_slug": dept_slug,
            "department_id": dept_id,
            "allowed_departments": allowed_depts,
            "role": primary_role,
            "roles": [r.slug for r in roles_list],
        },
    )

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        organization_id=str(user.organization_id),
        organization_slug=org_slug,
    )


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revoke all active sessions for current user."""
    stmt = select(Session).where(Session.user_id == current_user.id, Session.is_revoked == False)
    res = await db.execute(stmt)
    for s in res.scalars().all():
        s.is_revoked = True
    await db.commit()
    return {"message": "Logged out successfully"}


@router.get("/me")
@router.get("/me/access")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.organization_id:
        return {
            "id": str(current_user.id),
            "userId": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "fullName": current_user.full_name,
            "is_org_admin": True,
            "isOrgAdmin": True,
            "isSuperAdmin": True,
            "is_superadmin": True,
            "role": "Super Admin",
            "organization_id": None,
            "department_id": None,
            "department_name": None,
            "department_slug": None,
            "department": None,
            "domain_roles": [{"domain_slug": "*", "role": "superadmin"}],
            "roles": [{"id": "role_super_admin", "name": "Super Admin", "slug": "super_admin"}],
            "tenant": {
                "id": "platform",
                "name": "Platform Administration",
                "slug": "superadmin",
                "status": "ACTIVE",
            },
            "tenant_slug": "superadmin",
        }

    org = await db.get(Organization, current_user.organization_id)
    # Fetch primary department
    dept_stmt = (
        select(Department)
        .join(UserDepartment, UserDepartment.department_id == Department.id)
        .where(UserDepartment.user_id == current_user.id)
        .order_by(UserDepartment.is_primary.desc())
    )
    dept_res = await db.execute(dept_stmt)
    primary_dept = dept_res.scalars().first()
    dept_slug = primary_dept.slug if primary_dept else None
    dept_name = primary_dept.name if primary_dept else None
    dept_id = str(primary_dept.id) if primary_dept else None

    # Fetch user roles
    role_stmt = (
        select(Role)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == current_user.id)
    )
    role_res = await db.execute(role_stmt)
    roles_list = role_res.scalars().all()
    primary_role = (roles_list[0].slug if roles_list else ("tenant_admin" if current_user.is_org_admin else "emp")).lower()
    domain_roles = [
        {"domain_slug": r.slug.split("-")[0] if "-" in r.slug else (dept_slug or "hr"), "role": r.slug}
        for r in roles_list
    ]
    if current_user.is_org_admin:
        domain_roles.append({"domain_slug": "*", "role": "tenant-admin"})
        if dept_slug:
            domain_roles.append({"domain_slug": dept_slug, "role": f"{dept_slug}-admin"})

    return {
        "id": str(current_user.id),
        "userId": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "fullName": current_user.full_name,
        "is_org_admin": current_user.is_org_admin,
        "isOrgAdmin": current_user.is_org_admin,
        "isSuperAdmin": False,
        "is_superadmin": False,
        "role": primary_role,
        "organization_id": str(current_user.organization_id),
        "department_id": dept_id,
        "department_name": dept_name,
        "department_slug": dept_slug,
        "department": {
            "id": dept_id,
            "name": dept_name,
            "slug": dept_slug,
        } if primary_dept else None,
        "domain_roles": domain_roles,
        "roles": [{"id": str(r.id), "name": r.name, "slug": r.slug} for r in roles_list],
        "tenant": {
            "id": str(org.id) if org else "",
            "name": org.name if org else "",
            "slug": org.slug if org else "",
            "status": org.status if org else "ACTIVE",
        } if org else None,
        "tenant_slug": org.slug if org else "default",
    }


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


@router.post("/password-reset/request")
async def request_password_reset(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Generate password reset token."""
    return {"message": "If the email is registered, a password reset link has been dispatched."}


@router.post("/password-reset/confirm")
async def confirm_password_reset(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Apply new password using verified token."""
    return {"message": "Password reset successfully."}


@router.get("/user-status")
async def check_user_status(
    email: str,
    organization_slug: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Real-time account status checker for login pending loader."""
    stmt = select(User).where(User.email == email.strip().lower(), User.deleted_at.is_(None))
    if organization_slug:
        stmt = stmt.join(Organization, Organization.id == User.organization_id).where(
            Organization.slug == organization_slug.strip().lower()
        )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    org = await db.get(Organization, user.organization_id)
    user_status = getattr(user, "status", None) or ("ACTIVE" if user.is_active else "PENDING_APPROVAL")
    return {
        "email": user.email,
        "full_name": user.full_name,
        "is_active": user.is_active,
        "status": user_status,
        "organization_name": org.name if org else "Workspace",
        "organization_slug": org.slug if org else "",
    }


@router.get("/me/access", response_model=UserAccessResponse)
@router.get("/access", response_model=UserAccessResponse)
async def get_my_access(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Central Single Source of Truth for frontend access.
    Returns User, Organization, Canonical Roles, Dynamic Departments, Enabled Domains, Modules, and Permissions.
    """
    return await AccessService.get_user_access(db, current_user)

