import asyncio
import logging
import math
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select, update, delete, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import (
    User,
    Department,
    UserDepartment,
    Role,
    UserRole,
    RolePermission,
    UserPermission,
)
from app.models.organization_models import Organization
from app.models.platform_models import Permission, PlatformAdmin
from app.services.audit_service import audit_service
from app.core.security import hash_password
from app.schemas.access import (
    UserListItem,
    PaginatedUsersResponse,
    DepartmentItem,
    RoleItem,
    UserStatusUpdate,
    UserDepartmentAssign,
    UserRoleAssign,
    UserPermissionOverride,
)

logger = logging.getLogger("nexusrag.users")

router = APIRouter(prefix="/users", tags=["User & Identity Management"])


def is_valid_uuid(val: Optional[str]) -> bool:
    if not val:
        return False
    try:
        uuid.UUID(str(val).strip())
        return True
    except (ValueError, AttributeError, TypeError):
        return False


class UserCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    name: Optional[str] = None
    password: Optional[str] = "Matrix@2026Secure!"
    department_id: Optional[str] = None
    department_ids: Optional[List[str]] = None
    organization_id: Optional[str] = None
    role_id: Optional[str] = None
    role_slug: Optional[str] = None
    role_slugs: Optional[List[str]] = None
    role: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    is_active: Optional[bool] = True
    is_superadmin: Optional[bool] = False
    is_org_admin: Optional[bool] = False


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    department_id: Optional[str] = None
    department_ids: Optional[List[str]] = None
    role_id: Optional[str] = None
    role_slug: Optional[str] = None
    role_slugs: Optional[List[str]] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("", response_model=PaginatedUsersResponse)
async def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(25, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    department_id: Optional[str] = Query(None, description="Filter by department ID"),
    role_id: Optional[str] = Query(None, description="Filter by role ID"),
    role_slug: Optional[str] = Query(None, description="Filter by role slug"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: ACTIVE, PENDING_APPROVAL, SUSPENDED, INVITED"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Paginated, multi-filter user list with batch eager loading (no N+1 queries).
    Returns complete multi-department array and multi-role array for each user.
    """
    org_id = current_user.organization_id

    # Base query
    base_filter = [User.deleted_at.is_(None)]
    if org_id:
        base_filter.append(User.organization_id == org_id)

    if search:
        search_term = f"%{search.strip().lower()}%"
        base_filter.append(or_(
            func.lower(User.full_name).ilike(search_term),
            func.lower(User.email).ilike(search_term),
        ))

    if status_filter:
        base_filter.append(User.status == status_filter.upper())

    if is_active is not None:
        base_filter.append(User.is_active == is_active)

    if department_id and is_valid_uuid(department_id):
        base_filter.append(
            User.id.in_(
                select(UserDepartment.user_id).where(UserDepartment.department_id == department_id)
            )
        )

    if role_id and is_valid_uuid(role_id):
        base_filter.append(
            User.id.in_(
                select(UserRole.user_id).where(UserRole.role_id == role_id)
            )
        )
    elif role_slug:
        base_filter.append(
            User.id.in_(
                select(UserRole.user_id).join(Role, UserRole.role_id == Role.id).where(Role.slug == role_slug.lower())
            )
        )

    # Count total matching users
    count_stmt = select(func.count(User.id)).where(*base_filter)
    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0
    pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size

    # Fetch users for current page
    users_stmt = (
        select(User)
        .where(*base_filter)
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    users_res = await db.execute(users_stmt)
    users = users_res.scalars().all()
    user_ids = [u.id for u in users]

    # Pre-fetch organizations
    org_stmt = select(Organization)
    org_res = await db.execute(org_stmt)
    org_map = {str(o.id): o.name for o in org_res.scalars().all()}

    # Batch pre-fetch departments for current page users
    user_depts_map: Dict[str, List[DepartmentItem]] = {}
    if user_ids:
        ud_stmt = (
            select(UserDepartment.user_id, Department.id, Department.name, Department.slug, UserDepartment.is_primary)
            .join(Department, UserDepartment.department_id == Department.id)
            .where(UserDepartment.user_id.in_(user_ids))
            .order_by(UserDepartment.is_primary.desc(), Department.name.asc())
        )
        ud_res = await db.execute(ud_stmt)
        for u_id, d_id, d_name, d_slug, is_prim in ud_res.all():
            user_depts_map.setdefault(str(u_id), []).append(
                DepartmentItem(
                    id=str(d_id),
                    name=d_name,
                    slug=d_slug,
                    is_primary=bool(is_prim),
                )
            )

    # Batch pre-fetch roles for current page users
    user_roles_map: Dict[str, List[RoleItem]] = {}
    role_ids = []
    if user_ids:
        ur_stmt = (
            select(UserRole.user_id, Role.id, Role.name, Role.slug, Role.is_system)
            .join(Role, UserRole.role_id == Role.id)
            .where(UserRole.user_id.in_(user_ids))
        )
        ur_res = await db.execute(ur_stmt)
        for u_id, r_id, r_name, r_slug, r_is_sys in ur_res.all():
            user_roles_map.setdefault(str(u_id), []).append(
                RoleItem(
                    id=str(r_id),
                    name=r_name,
                    slug=r_slug.lower(),
                    is_system=bool(r_is_sys),
                )
            )
            role_ids.append(r_id)

    # Batch pre-fetch role permissions for current page users
    role_perms_map: Dict[str, List[str]] = {}
    if role_ids:
        rp_stmt = (
            select(RolePermission.role_id, Permission.permission_key)
            .join(Permission, RolePermission.permission_id == Permission.id)
            .where(RolePermission.role_id.in_(role_ids))
        )
        rp_res = await db.execute(rp_stmt)
        for r_id, p_key in rp_res.all():
            role_perms_map.setdefault(str(r_id), []).append(p_key.lower())

    items = []
    for u in users:
        depts = user_depts_map.get(str(u.id), [])
        roles = user_roles_map.get(str(u.id), [])

        primary_dept = depts[0] if depts else None
        primary_role = roles[0] if roles else None

        # Calculate effective permissions
        effective_perms = []
        if u.is_org_admin:
            effective_perms = ["*"]
        else:
            for r in roles:
                if r.id and r.id in role_perms_map:
                    effective_perms.extend(role_perms_map[r.id])
            effective_perms = sorted(list(set(effective_perms)))

        user_status = getattr(u, "status", None) or ("ACTIVE" if u.is_active else "PENDING_APPROVAL")
        display_role = "tenant_admin" if u.is_org_admin else (primary_role.slug if primary_role else "emp")

        items.append(
            UserListItem(
                id=str(u.id),
                email=u.email,
                full_name=u.full_name,
                name=u.full_name,
                is_active=u.is_active,
                status=user_status,
                is_org_admin=u.is_org_admin,
                is_superadmin=u.organization_id is None and u.is_org_admin,
                organization_id=str(u.organization_id) if u.organization_id else None,
                tenant=org_map.get(str(u.organization_id), "Global / Platform") if u.organization_id else "Global / Platform",
                departments=depts,
                roles=roles,
                primary_department=primary_dept,
                primary_role=primary_role,
                permission_keys=effective_perms,
                created_at=u.created_at.isoformat() if u.created_at else None,
                # Compatibility fields
                department_name=primary_dept.name if primary_dept else "Tenant Wide",
                department_slug=primary_dept.slug if primary_dept else None,
                department_id=primary_dept.id if primary_dept else None,
                role=display_role,
                role_name=display_role,
                role_slug=display_role,
                role_id=primary_role.id if primary_role else None,
            )
        )

    # SuperAdmin injection on page 1 if not org-scoped
    if not org_id and page == 1:
        admin_res = await db.execute(select(PlatformAdmin))
        admins = admin_res.scalars().all()
        existing_emails = {i.email.lower() for i in items}
        for a in admins:
            if a.email.lower() not in existing_emails:
                items.insert(0, UserListItem(
                    id=str(a.id),
                    email=a.email,
                    full_name=a.full_name or "Platform SuperAdmin",
                    name=a.full_name or "Platform SuperAdmin",
                    is_active=a.is_active,
                    status="ACTIVE",
                    is_org_admin=True,
                    is_superadmin=True,
                    organization_id=None,
                    tenant="Global / Platform",
                    departments=[DepartmentItem(id="platform", name="Platform Infrastructure", slug="platform", is_primary=True)],
                    roles=[RoleItem(id=None, name="superadmin", slug="superadmin", is_system=True)],
                    permission_keys=["*"],
                    created_at=a.created_at.isoformat() if a.created_at else None,
                    department_name="Platform Infrastructure",
                    department_slug="platform",
                    role="superadmin",
                    role_name="superadmin",
                    role_slug="superadmin",
                ))

    return PaginatedUsersResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        pages=pages,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new user within the organization.
    Assigns dynamic departments and canonical roles (tenant_admin, department_admin, manager, support, emp).
    """
    org_id = payload.organization_id or current_user.organization_id
    if not org_id and not payload.is_superadmin:
        from app.models.organization_models import Organization
        first_org_res = await db.execute(select(Organization).limit(1))
        first_org = first_org_res.scalar_one_or_none()
        if first_org:
            org_id = first_org.id
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot create user without organization context")

    final_name = (payload.full_name or payload.name or "").strip()
    if not final_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Full name is required (at least 2 characters)")

    # Check for existing email within org
    if org_id:
        stmt = select(User).where(
            User.organization_id == org_id,
            func.lower(User.email) == payload.email.lower(),
            User.deleted_at.is_(None),
        )
    else:
        stmt = select(User).where(
            func.lower(User.email) == payload.email.lower(),
            User.deleted_at.is_(None),
        )
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{payload.email}' already exists in this organization",
        )

    # Determine canonical role
    role_slug = (payload.role_slug or payload.role or "emp").lower().strip()
    target_role_id = payload.role_id
    if target_role_id:
        r_obj = await db.get(Role, target_role_id)
        if r_obj:
            role_slug = (r_obj.slug or "").lower()

    is_org_admin = role_slug in ["tenant_admin", "org_admin", "admin"] or bool(payload.is_org_admin)
    initial_status = payload.status.upper() if payload.status else "ACTIVE"
    is_active = (initial_status == "ACTIVE") if payload.is_active is None else payload.is_active

    new_user = User(
        organization_id=org_id,
        email=payload.email.lower().strip(),
        full_name=final_name,
        password_hash=hash_password(payload.password or "Matrix@2026Secure!"),
        is_active=is_active,
        status=initial_status,
        is_org_admin=is_org_admin,
        email_verified=True,
    )
    db.add(new_user)
    await db.flush()

    # Assign Departments
    dept_ids = []
    if payload.department_ids:
        dept_ids.extend(payload.department_ids)
    elif payload.department_id:
        dept_ids.append(payload.department_id)

    primary_set = False
    for d_id in dept_ids:
        if is_valid_uuid(d_id):
            dept = await db.get(Department, d_id)
            if dept and str(dept.organization_id) == str(org_id):
                db.add(UserDepartment(user_id=new_user.id, department_id=dept.id, is_primary=not primary_set))
                primary_set = True

    # Assign Canonical Role
    target_role = None
    if target_role_id and is_valid_uuid(target_role_id):
        target_role = await db.get(Role, target_role_id)

    if not target_role:
        target_role_stmt = select(Role).where(
            or_(
                Role.organization_id == org_id,
                Role.organization_id.is_(None),
            ),
            Role.slug == role_slug,
        )
        target_role_res = await db.execute(target_role_stmt)
        target_role = target_role_res.scalars().first()

    if not target_role:
        # Fallback to emp or any active role
        def_stmt = select(Role).where(
            or_(
                Role.organization_id == org_id,
                Role.organization_id.is_(None),
            ),
            Role.slug.in_(["emp", "employee", "org_admin", "superadmin"])
        )
        def_res = await db.execute(def_stmt)
        target_role = def_res.scalars().first()

    if target_role:
        db.add(UserRole(user_id=new_user.id, role_id=target_role.id))

    await db.commit()
    await db.refresh(new_user)

    try:
        if org_id and current_user:
            await audit_service.log_event(
                db=db,
                action="USER_CREATED",
                organization_id=str(org_id),
                actor_id=str(current_user.id),
                resource_type="user",
                resource_id=str(new_user.id),
                metadata={"email": new_user.email, "role": role_slug, "status": initial_status},
            )
    except Exception as e:
        logger.warning(f"Audit log failed during user creation: {e}")

    # Build and return user record directly
    return {
        "id": str(new_user.id),
        "email": new_user.email,
        "full_name": new_user.full_name,
        "name": new_user.full_name,
        "status": new_user.status,
        "is_active": new_user.is_active,
        "is_org_admin": new_user.is_org_admin,
        "organization_id": str(new_user.organization_id) if new_user.organization_id else None,
        "department_id": str(dept_ids[0]) if dept_ids else None,
        "role_id": str(target_role.id) if target_role else None,
        "role_slug": role_slug,
        "created_at": new_user.created_at.isoformat() if new_user.created_at else None,
    }


@router.get("/{user_id}")
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get single user profile with complete departments and roles arrays."""
    user = await db.get(User, user_id)
    if not user or user.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if current_user.organization_id and str(user.organization_id) != str(current_user.organization_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Fetch departments
    ud_stmt = (
        select(Department.id, Department.name, Department.slug, UserDepartment.is_primary)
        .join(UserDepartment, UserDepartment.department_id == Department.id)
        .where(UserDepartment.user_id == user.id)
        .order_by(UserDepartment.is_primary.desc())
    )
    ud_res = await db.execute(ud_stmt)
    departments = [
        {"id": str(d[0]), "name": d[1], "slug": d[2], "is_primary": bool(d[3])}
        for d in ud_res.all()
    ]
    primary_dept = departments[0] if departments else None

    # Fetch roles
    ur_stmt = (
        select(Role.id, Role.name, Role.slug, Role.is_system)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user.id)
    )
    ur_res = await db.execute(ur_stmt)
    roles = [
        {"id": str(r[0]), "name": r[1], "slug": r[2].lower(), "is_system": bool(r[3])}
        for r in ur_res.all()
    ]
    primary_role = roles[0] if roles else None
    role_slug = primary_role["slug"] if primary_role else ("tenant_admin" if user.is_org_admin else "emp")

    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "name": user.full_name,
        "is_active": user.is_active,
        "status": getattr(user, "status", "ACTIVE") or ("ACTIVE" if user.is_active else "PENDING_APPROVAL"),
        "is_org_admin": user.is_org_admin,
        "organization_id": str(user.organization_id),
        "departments": departments,
        "roles": roles,
        "primary_department": primary_dept,
        "primary_role": primary_role,
        # Compatibility fields
        "department_id": primary_dept["id"] if primary_dept else None,
        "department_name": primary_dept["name"] if primary_dept else "Tenant Wide",
        "department_slug": primary_dept["slug"] if primary_dept else None,
        "role_id": primary_role["id"] if primary_role else None,
        "role_name": role_slug,
        "role_slug": role_slug,
        "role": role_slug,
    }


@router.patch("/{user_id}")
@router.put("/{user_id}")
async def update_user(
    user_id: str,
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user information, assign departments, and update canonical roles."""
    user = await db.get(User, user_id)
    if not user or user.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if current_user.organization_id and str(user.organization_id) != str(current_user.organization_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()

    if payload.email is not None:
        user.email = payload.email.lower().strip()

    if payload.password:
        user.password_hash = hash_password(payload.password)

    if payload.status is not None:
        user.status = payload.status.upper()
        user.is_active = (user.status == "ACTIVE")
    elif payload.is_active is not None:
        user.is_active = payload.is_active
        user.status = "ACTIVE" if payload.is_active else "SUSPENDED"

    # Handle department reassignment
    if payload.department_ids is not None or payload.department_id is not None:
        await db.execute(delete(UserDepartment).where(UserDepartment.user_id == user.id))
        dept_ids = payload.department_ids or ([payload.department_id] if payload.department_id else [])
        primary_set = False
        for d_id in dept_ids:
            if is_valid_uuid(d_id):
                dept = await db.get(Department, d_id)
                if dept and str(dept.organization_id) == str(user.organization_id):
                    db.add(UserDepartment(user_id=user.id, department_id=dept.id, is_primary=not primary_set))
                    primary_set = True

    # Handle role reassignment
    if payload.role_id is not None or payload.role_slug is not None:
        await db.execute(delete(UserRole).where(UserRole.user_id == user.id))
        role_slug = (payload.role_slug or "emp").lower().strip()
        if payload.role_id and is_valid_uuid(payload.role_id):
            role = await db.get(Role, payload.role_id)
            if role:
                role_slug = role.slug.lower()
        
        target_role_stmt = select(Role).where(
            Role.organization_id == user.organization_id,
            Role.slug == role_slug,
        )
        target_role_res = await db.execute(target_role_stmt)
        target_role = target_role_res.scalar_one_or_none()
        if target_role:
            db.add(UserRole(user_id=user.id, role_id=target_role.id))
            user.is_org_admin = (role_slug == "tenant_admin")

    await db.commit()
    await db.refresh(user)

    await audit_service.log_event(
        db=db,
        action="USER_UPDATED",
        organization_id=str(user.organization_id),
        actor_id=str(current_user.id),
        resource_type="user",
        resource_id=str(user.id),
        metadata={"email": user.email, "name": user.full_name, "status": user.status},
    )

    return await get_user(str(user.id), current_user=current_user, db=db)


@router.patch("/{user_id}/status")
async def update_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update user lifecycle status (ACTIVE, PENDING_APPROVAL, SUSPENDED).
    Guards: Prevents self-suspension and removing the last tenant_admin.
    """
    user = await db.get(User, user_id)
    if not user or user.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if current_user.organization_id and str(user.organization_id) != str(current_user.organization_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    target_status = (payload.status or ("ACTIVE" if payload.is_active else "SUSPENDED")).upper()

    # Guard 1: Cannot deactivate yourself
    if str(user.id) == str(current_user.id) and target_status in ["SUSPENDED", "PENDING_APPROVAL"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate or suspend your own administrator account.",
        )

    # Guard 2: Cannot deactivate the last active tenant_admin
    if user.is_org_admin and target_status in ["SUSPENDED", "PENDING_APPROVAL"]:
        admin_count_stmt = select(func.count(User.id)).where(
            User.organization_id == user.organization_id,
            User.is_org_admin == True,
            User.status == "ACTIVE",
            User.deleted_at.is_(None),
            User.id != user.id,
        )
        admin_count_res = await db.execute(admin_count_stmt)
        other_admins = admin_count_res.scalar() or 0
        if other_admins == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot suspend the last active Tenant Administrator in this organization.",
            )

    user.status = target_status
    user.is_active = (target_status == "ACTIVE")
    await db.commit()

    await audit_service.log_event(
        db=db,
        action="USER_STATUS_UPDATED",
        organization_id=str(user.organization_id),
        actor_id=str(current_user.id),
        resource_type="user",
        resource_id=str(user.id),
        metadata={"email": user.email, "new_status": target_status},
    )

    return {"message": f"User status successfully updated to {target_status}", "id": str(user.id), "status": target_status, "is_active": user.is_active}


@router.post("/{user_id}/approve")
async def approve_user_registration(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Org Admin Review & Approve endpoint: transitions PENDING_APPROVAL -> ACTIVE.
    """
    user = await db.get(User, user_id)
    if not user or user.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if current_user.organization_id and str(user.organization_id) != str(current_user.organization_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    user.status = "ACTIVE"
    user.is_active = True
    await db.commit()

    # Dispatch approval email if SMTP is configured
    try:
        from app.services.email_service import email_service
        from app.models.organization_models import Organization
        org_obj = await db.get(Organization, user.organization_id)
        org_name = org_obj.name if org_obj else "Nexus Enterprise"
        smtp_cfg = await email_service.get_smtp_config_for_org(db, user.organization_id)
        if smtp_cfg.get("is_enabled") and smtp_cfg.get("host"):
            login_url = f"http://localhost:3000/login"
            asyncio.create_task(
                email_service.send_approval_email(
                    config=smtp_cfg,
                    to_email=user.email,
                    user_name=user.full_name or user.email,
                    organization_name=org_name,
                    login_url=login_url,
                )
            )
    except Exception as e:
        logger.warning(f"Failed to dispatch user approval email: {e}")

    await audit_service.log_event(
        db=db,
        action="USER_REGISTRATION_APPROVED",
        organization_id=str(user.organization_id),
        actor_id=str(current_user.id),
        resource_type="user",
        resource_id=str(user.id),
        metadata={"email": user.email, "approved_by": current_user.email},
    )

    return {"message": "User registration successfully approved", "id": str(user.id), "status": "ACTIVE", "is_active": True}


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft delete user in organization with safety guards."""
    user = await db.get(User, user_id)
    if not user or (current_user.organization_id and str(user.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if str(user.id) == str(current_user.id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own account")

    user.deleted_at = datetime.now(timezone.utc)
    user.is_active = False
    user.status = "SUSPENDED"
    await db.commit()

    await audit_service.log_event(
        db=db,
        action="USER_DELETED",
        organization_id=str(user.organization_id) if user.organization_id else "platform",
        actor_id=str(current_user.id),
        resource_type="user",
        resource_id=str(user.id),
        metadata={"email": user.email, "deleted": True},
    )

    return {"message": "User successfully removed", "id": str(user.id)}
