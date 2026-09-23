import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user, get_current_platform_admin
from app.core.security import hash_password, create_activation_token
from app.models.identity_models import User, Domain, Role, RolePermission, UserRole
from app.models.organization_models import Organization, OrganizationSettings, OrganizationCustomDomain, OrganizationPack
from app.models.platform_models import Plan, Pack, Permission, PlatformAdmin
from app.services.audit_service import audit_service

router = APIRouter(prefix="/organizations", tags=["Organizations"])


def is_valid_uuid(val: Optional[str]) -> bool:
    if not val:
        return False
    try:
        uuid.UUID(str(val).strip())
        return True
    except (ValueError, AttributeError, TypeError):
        return False


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    slug: Optional[str] = None
    subdomain: Optional[str] = None
    plan_id: Optional[str] = None
    pack_id: Optional[str] = None
    admin_email: Optional[str] = None
    admin_name: Optional[str] = None
    admin_password: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    subdomain: Optional[str] = None
    status: Optional[str] = None
    plan_id: Optional[str] = None
    pack_id: Optional[str] = None


class OrganizationSettingsUpdate(BaseModel):
    mfa_required: Optional[bool] = None
    password_login_enabled: Optional[bool] = None
    session_timeout_minutes: Optional[int] = None
    allowed_email_domains: Optional[List[str]] = None
    security_config: Optional[Dict[str, Any]] = None
    branding_config: Optional[Dict[str, Any]] = None


@router.get("/resolve")
async def resolve_organization_subdomain(
    subdomain: str,
    department: Optional[str] = None,
    hostname: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Resolve an organization, department, and domain by hostname or subdomain."""
    clean = subdomain.strip().lower()
    
    # 1. Match Organization by slug or ID
    stmt = (
        select(Organization)
        .options(
            selectinload(Organization.plan),
            selectinload(Organization.custom_domains),
        )
        .where(
            or_(
                Organization.slug == clean,
                Organization.id == clean if is_valid_uuid(clean) else False,
            ),
            Organization.deleted_at.is_(None),
        )
    )
    res = await db.execute(stmt)
    org = res.scalars().first()

    # 2. Match Organization by custom domain hostname
    if not org:
        cd_stmt = (
            select(Organization)
            .join(OrganizationCustomDomain, OrganizationCustomDomain.organization_id == Organization.id)
            .options(
                selectinload(Organization.plan),
                selectinload(Organization.custom_domains),
            )
            .where(
                or_(
                    OrganizationCustomDomain.hostname == clean,
                    OrganizationCustomDomain.hostname.ilike(f"{clean}%"),
                ),
                Organization.deleted_at.is_(None),
            )
        )
        cd_res = await db.execute(cd_stmt)
        org = cd_res.scalars().first()

    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization for '{subdomain}' not found",
        )

    # 3. Check Organization Status
    if org.status.upper() == "SUSPENDED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Organization '{org.name}' is currently suspended.",
        )

    # 4. Resolve Department / Domain if specified
    dept_obj = None
    if department:
        clean_dept = department.strip().lower()
        dept_stmt = select(Domain).where(
            Domain.organization_id == org.id,
            Domain.slug == clean_dept,
        )
        dept_res = await db.execute(dept_stmt)
        dept_obj = dept_res.scalars().first()

    # 5. Fetch all active domains for organization
    all_doms_stmt = select(Domain).where(
        Domain.organization_id == org.id,
        Domain.status == "ACTIVE",
    )
    all_doms = (await db.execute(all_doms_stmt)).scalars().all()

    return {
        "tenant": {
            "id": str(org.id),
            "name": org.name,
            "slug": org.slug,
            "status": org.status,
            "plan_name": org.plan.name if org.plan else "Standard Plan",
        },
        "department": {
            "id": str(dept_obj.id),
            "slug": dept_obj.slug,
            "name": dept_obj.name,
            "status": dept_obj.status,
        } if dept_obj else None,
        "domain": {
            "id": str(org.custom_domains[0].id) if org.custom_domains else str(org.id),
            "hostname": hostname or (org.custom_domains[0].hostname if org.custom_domains else f"{org.slug}.nexusrag.app"),
            "status": "ACTIVE",
        },
        "active_departments": [
            {
                "id": str(d.id),
                "slug": d.slug,
                "name": d.name,
                "status": d.status,
            }
            for d in all_doms
        ],
    }


@router.get("")
async def list_organizations(
    db: AsyncSession = Depends(get_db),
):
    """List all organizations across the platform."""
    stmt = (
        select(Organization)
        .options(
            selectinload(Organization.plan),
            selectinload(Organization.custom_domains),
            selectinload(Organization.organization_packs).selectinload(OrganizationPack.pack),
        )
        .where(Organization.deleted_at.is_(None))
        .order_by(Organization.created_at.desc())
    )
    res = await db.execute(stmt)
    orgs = res.scalars().all()
    return [
        {
            "id": str(o.id),
            "name": o.name,
            "slug": o.slug,
            "status": o.status,
            "plan_id": str(o.plan_id) if o.plan_id else None,
            "plan_name": o.plan.name if o.plan else "Standard Plan",
            "subdomain": (
                o.custom_domains[0].hostname
                if o.custom_domains
                else f"{o.slug}.nexusrag.app"
            ),
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in orgs
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_organization(
    payload: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
):
    """SuperAdmin creates an organization, provisions default RBAC roles, domain workspaces, and admin user."""
    clean_slug = (payload.slug or payload.subdomain or payload.name).strip().lower().replace(" ", "_")
    clean_slug = "".join(c for c in clean_slug if c.isalnum() or c == "_")[:50]
    if not clean_slug:
        clean_slug = f"org_{uuid.uuid4().hex[:8]}"

    existing = await db.execute(
        select(Organization).where(Organization.slug == clean_slug)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Organization with slug '{clean_slug}' already exists",
        )

    # 1. Safely resolve Plan & Pack
    resolved_plan_id = None
    target_pack = None

    candidate_id = (payload.plan_id or payload.pack_id or "").strip()
    if candidate_id:
        # Check Plan table with safe UUID check
        plan_conditions = [Plan.slug == candidate_id]
        if is_valid_uuid(candidate_id):
            plan_conditions.append(Plan.id == candidate_id)

        plan_res = await db.execute(select(Plan).where(or_(*plan_conditions)))
        found_plan = plan_res.scalars().first()
        if found_plan:
            resolved_plan_id = found_plan.id
        else:
            # Check Pack table with safe UUID check
            pack_conditions = [Pack.slug == candidate_id]
            if is_valid_uuid(candidate_id):
                pack_conditions.append(Pack.id == candidate_id)

            pack_res = await db.execute(select(Pack).where(or_(*pack_conditions)))
            target_pack = pack_res.scalars().first()

    # Fallback to default Plan if no specific plan matched
    if not resolved_plan_id:
        default_plan = (await db.execute(select(Plan).where(Plan.is_active == True))).scalars().first()
        if default_plan:
            resolved_plan_id = default_plan.id
        else:
            fallback_plan = Plan(
                name="Standard Enterprise Plan",
                slug="standard_enterprise",
                max_users=1000,
                is_active=True,
            )
            db.add(fallback_plan)
            await db.flush()
            resolved_plan_id = fallback_plan.id

    # 2. Create Organization
    org = Organization(
        name=payload.name.strip(),
        slug=clean_slug,
        plan_id=resolved_plan_id,
        status="ACTIVE",
    )
    db.add(org)
    await db.flush()

    # 3. Create Settings
    settings_obj = OrganizationSettings(
        organization_id=org.id,
        allowed_email_domains=[f"{clean_slug}.com"] if clean_slug else [],
    )
    db.add(settings_obj)

    # 4. Create Custom Domain / Subdomain
    subdomain_val = (payload.subdomain or clean_slug).strip().lower()
    custom_domain = OrganizationCustomDomain(
        organization_id=org.id,
        hostname=f"{subdomain_val}.nexusrag.app" if "." not in subdomain_val else subdomain_val,
        verification_status="VERIFIED",
        is_primary=True,
        verified_at=datetime.now(timezone.utc),
    )
    db.add(custom_domain)

    # 5. Attach Pack if provided
    if target_pack:
        db.add(OrganizationPack(organization_id=org.id, pack_id=target_pack.id, is_active=True))

    # 6. Seed Standard Organization RBAC Roles
    admin_role = Role(
        organization_id=org.id,
        name="Organization Admin",
        slug="org_admin",
        description="Full tenant administrator access",
        is_system=True,
        is_active=True,
    )
    domain_admin_role = Role(
        organization_id=org.id,
        name="Domain Admin",
        slug="domain_admin",
        description="Departmental manager and reviewer access",
        is_system=False,
        is_active=True,
    )
    member_role = Role(
        organization_id=org.id,
        name="Employee / Member",
        slug="employee",
        description="Standard employee access to domain knowledge and AI assistant",
        is_system=False,
        is_active=True,
    )
    db.add_all([admin_role, domain_admin_role, member_role])
    await db.flush()

    # Assign all permissions to Organization Admin role
    all_perms = (await db.execute(select(Permission))).scalars().all()
    for p in all_perms:
        db.add(RolePermission(role_id=admin_role.id, permission_id=p.id))

    # 7. Create Initial Admin User & Bind Role
    admin_user = None
    if payload.admin_email:
        admin_user = User(
            organization_id=org.id,
            email=payload.admin_email.strip().lower(),
            full_name=payload.admin_name.strip() if payload.admin_name else "Organization Admin",
            password_hash=hash_password(payload.admin_password or "Password123!"),
            is_active=True,
            is_org_admin=True,
            email_verified=True,
        )
        db.add(admin_user)
        await db.flush()

        # Bind user to Organization Admin role
        db.add(UserRole(user_id=admin_user.id, role_id=admin_role.id))

    # 8. Seed initial business domain workspaces and departments (HR, Finance)
    domains_to_create = [
        ("Human Resources", "hr", "Company employee records and policy knowledge"),
        ("Finance & Accounting", "finance", "Invoices, budgets, and financial reporting"),
    ]
    for d_name, d_slug, d_desc in domains_to_create:
        d_obj = Domain(
            organization_id=org.id,
            name=d_name,
            slug=d_slug,
            description=d_desc,
            status="ACTIVE",
        )
        dept_obj = Department(
            organization_id=org.id,
            name=d_name,
            slug=d_slug,
            description=d_desc,
            status="ACTIVE",
        )
        db.add(d_obj)
        db.add(dept_obj)

    await db.commit()
    await db.refresh(org)

    await audit_service.log_event(
        db=db,
        action="ORGANIZATION_CREATED",
        organization_id=str(org.id),
        resource_type="organization",
        resource_id=str(org.id),
        metadata={
            "name": org.name,
            "slug": org.slug,
            "admin_email": payload.admin_email,
        },
    )

    return {
        "id": str(org.id),
        "name": org.name,
        "slug": org.slug,
        "subdomain": custom_domain.hostname,
        "status": org.status,
        "plan_id": str(org.plan_id),
        "admin_email": admin_user.email if admin_user else None,
        "created_at": org.created_at.isoformat() if org.created_at else None,
    }


@router.get("/{org_id}")
async def get_organization(
    org_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve organization details along with active domains."""
    filter_cond = [Organization.deleted_at.is_(None)]
    if is_valid_uuid(org_id):
        filter_cond.append(or_(Organization.id == org_id, Organization.slug == org_id.strip().lower()))
    else:
        filter_cond.append(Organization.slug == org_id.strip().lower())

    stmt = (
        select(Organization)
        .options(
            selectinload(Organization.plan),
            selectinload(Organization.custom_domains),
            selectinload(Organization.organization_packs).selectinload(OrganizationPack.pack),
        )
        .where(*filter_cond)
    )
    res = await db.execute(stmt)
    org = res.scalars().first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    # Fetch active domains for this organization
    dom_stmt = select(Domain).where(Domain.organization_id == org.id, Domain.status == "ACTIVE")
    dom_res = await db.execute(dom_stmt)
    active_domains = dom_res.scalars().all()

    return {
        "id": str(org.id),
        "name": org.name,
        "slug": org.slug,
        "subdomain": org.custom_domains[0].hostname if org.custom_domains else f"{org.slug}.nexusrag.app",
        "status": org.status,
        "plan_id": str(org.plan_id) if org.plan_id else None,
        "plan_name": org.plan.name if org.plan else "Standard Plan",
        "plan": {
            "id": str(org.plan.id) if org.plan else str(org.plan_id or ""),
            "name": org.plan.name if org.plan else "Standard Plan",
            "slug": org.plan.slug if org.plan else "standard",
        } if org.plan else None,
        "domains": [
            {
                "id": str(d.id),
                "name": d.name,
                "slug": d.slug,
                "status": d.status,
                "description": d.description,
            }
            for d in active_domains
        ],
        "created_at": org.created_at.isoformat() if org.created_at else None,
    }


@router.get("/{org_id}/settings")
async def get_organization_settings(
    org_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve settings for a specific organization."""
    filter_cond = [Organization.deleted_at.is_(None)]
    if is_valid_uuid(org_id):
        filter_cond.append(or_(Organization.id == org_id, Organization.slug == org_id.strip().lower()))
    else:
        filter_cond.append(Organization.slug == org_id.strip().lower())

    org = (await db.execute(select(Organization).where(*filter_cond))).scalars().first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    sett_res = await db.execute(
        select(OrganizationSettings).where(OrganizationSettings.organization_id == org.id)
    )
    sett = sett_res.scalars().first()
    if not sett:
        sett = OrganizationSettings(
            organization_id=org.id,
            mfa_required=False,
            password_login_enabled=True,
            session_timeout_minutes=60,
            allowed_email_domains=[f"{org.slug}.com"] if org.slug else [],
        )
        db.add(sett)
        await db.commit()
        await db.refresh(sett)

    return {
        "organization_id": str(org.id),
        "mfa_required": sett.mfa_required,
        "password_login_enabled": sett.password_login_enabled,
        "session_timeout_minutes": sett.session_timeout_minutes,
        "allowed_email_domains": sett.allowed_email_domains or [],
        "security_config": sett.security_config or {},
        "branding_config": sett.branding_config or {},
    }


@router.put("/{org_id}/settings")
async def update_organization_settings(
    org_id: str,
    payload: OrganizationSettingsUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update settings for a specific organization."""
    filter_cond = [Organization.deleted_at.is_(None)]
    if is_valid_uuid(org_id):
        filter_cond.append(or_(Organization.id == org_id, Organization.slug == org_id.strip().lower()))
    else:
        filter_cond.append(Organization.slug == org_id.strip().lower())

    org = (await db.execute(select(Organization).where(*filter_cond))).scalars().first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    sett_res = await db.execute(
        select(OrganizationSettings).where(OrganizationSettings.organization_id == org.id)
    )
    sett = sett_res.scalars().first()
    if not sett:
        sett = OrganizationSettings(organization_id=org.id)
        db.add(sett)

    if payload.mfa_required is not None:
        sett.mfa_required = payload.mfa_required
    if payload.password_login_enabled is not None:
        sett.password_login_enabled = payload.password_login_enabled
    if payload.session_timeout_minutes is not None:
        sett.session_timeout_minutes = payload.session_timeout_minutes
    if payload.allowed_email_domains is not None:
        sett.allowed_email_domains = payload.allowed_email_domains
    if payload.security_config is not None:
        sett.security_config = payload.security_config
    if payload.branding_config is not None:
        sett.branding_config = payload.branding_config

    await db.commit()
    await db.refresh(sett)

    return {
        "organization_id": str(org.id),
        "mfa_required": sett.mfa_required,
        "password_login_enabled": sett.password_login_enabled,
        "session_timeout_minutes": sett.session_timeout_minutes,
        "allowed_email_domains": sett.allowed_email_domains or [],
        "security_config": sett.security_config or {},
        "branding_config": sett.branding_config or {},
        "message": "Organization settings updated successfully",
    }


class DomainConfigPayload(BaseModel):
    domain_slugs: List[str] = Field(default_factory=list)


DOMAIN_CATALOG = {
    "hr": {"name": "HR & People Operations", "desc": "Employee handbooks, leave policies, and HR assistant"},
    "finance": {"name": "Finance & Accounts Vault", "desc": "Invoices, expenses, and financial RAG"},
    "it": {"name": "IT Systems & Runbooks", "desc": "Technical runbooks, incident management, and server logs"},
    "legal": {"name": "Legal & Compliance Matrix", "desc": "Contracts, NDAs, and regulatory compliance"},
    "operations": {"name": "Operations & Logistics", "desc": "SOPs, supply chain docs, and workflow procedures"},
}


@router.post("/{org_id}/domains")
async def configure_organization_domains(
    org_id: str,
    payload: DomainConfigPayload,
    db: AsyncSession = Depends(get_db),
):
    org = await db.get(Organization, org_id)
    if not org or org.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    # Fetch existing domains for this org
    existing_res = await db.execute(select(Domain).where(Domain.organization_id == org.id))
    existing_domains = {d.slug: d for d in existing_res.scalars().all()}

    # Update or insert
    for slug, meta in DOMAIN_CATALOG.items():
        is_selected = slug in payload.domain_slugs or slug.lower() in [s.lower() for s in payload.domain_slugs]
        if slug in existing_domains:
            existing_domains[slug].status = "ACTIVE" if is_selected else "DISABLED"
        elif is_selected:
            new_dom = Domain(
                organization_id=org.id,
                name=meta["name"],
                slug=slug,
                description=meta["desc"],
                status="ACTIVE",
            )
            db.add(new_dom)

    # Link corresponding domain packs if exist
    for slug in payload.domain_slugs:
        pack_stmt = select(Pack).where(Pack.slug == slug.lower())
        pack_res = await db.execute(pack_stmt)
        p = pack_res.scalar_one_or_none()
        if p:
            op_stmt = select(OrganizationPack).where(
                OrganizationPack.organization_id == org.id,
                OrganizationPack.pack_id == p.id,
            )
            existing_op = (await db.execute(op_stmt)).scalar_one_or_none()
            if not existing_op:
                db.add(OrganizationPack(organization_id=org.id, pack_id=p.id, is_active=True))
            else:
                existing_op.is_active = True

    await db.commit()

    # Re-fetch updated active domains
    updated_res = await db.execute(select(Domain).where(Domain.organization_id == org.id, Domain.status == "ACTIVE"))
    updated_domains = updated_res.scalars().all()

    return {
        "organization_id": str(org.id),
        "domains": [
            {
                "id": str(d.id),
                "name": d.name,
                "slug": d.slug,
                "status": d.status,
                "description": d.description,
            }
            for d in updated_domains
        ],
        "message": f"Updated domain configuration for {org.name}.",
    }


@router.put("/{org_id}")
async def update_organization(
    org_id: str,
    payload: OrganizationUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update organization status, plan, pack, or metadata."""
    filter_cond = [Organization.deleted_at.is_(None)]
    if is_valid_uuid(org_id):
        filter_cond.append(or_(Organization.id == org_id, Organization.slug == org_id.strip().lower()))
    else:
        filter_cond.append(Organization.slug == org_id.strip().lower())

    stmt = (
        select(Organization)
        .options(
            selectinload(Organization.plan),
            selectinload(Organization.custom_domains),
            selectinload(Organization.organization_packs).selectinload(OrganizationPack.pack),
        )
        .where(*filter_cond)
    )
    res = await db.execute(stmt)
    org = res.scalars().first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    if payload.name:
        org.name = payload.name.strip()
    if payload.slug:
        clean_slug = payload.slug.strip().lower().replace(" ", "_")
        clean_slug = "".join(c for c in clean_slug if c.isalnum() or c == "_")[:50]
        if clean_slug:
            org.slug = clean_slug
    if payload.status:
        org.status = payload.status.strip().upper()

    candidate_id = (payload.plan_id or payload.pack_id or "").strip()
    if candidate_id:
        # 1. Check if candidate matches a Plan with safe UUID check
        plan_conds = [Plan.slug == candidate_id.lower()]
        if is_valid_uuid(candidate_id):
            plan_conds.append(Plan.id == candidate_id)
        plan_stmt = select(Plan).where(or_(*plan_conds))
        plan_res = await db.execute(plan_stmt)
        found_plan = plan_res.scalars().first()
        if found_plan:
            org.plan_id = found_plan.id

        # 2. Check if candidate matches a Pack with safe UUID check
        pack_conds = [Pack.slug == candidate_id.lower()]
        if is_valid_uuid(candidate_id):
            pack_conds.append(Pack.id == candidate_id)
        pack_stmt = select(Pack).where(or_(*pack_conds))
        pack_res = await db.execute(pack_stmt)
        found_pack = pack_res.scalars().first()
        if found_pack:
            # Check or link OrganizationPack
            op_stmt = select(OrganizationPack).where(
                OrganizationPack.organization_id == org.id,
                OrganizationPack.pack_id == found_pack.id,
            )
            op_res = await db.execute(op_stmt)
            existing_op = op_res.scalar_one_or_none()
            if not existing_op:
                db.add(OrganizationPack(organization_id=org.id, pack_id=found_pack.id, is_active=True))
            else:
                existing_op.is_active = True

            # If org has no valid plan, assign default starter plan
            if not org.plan_id:
                default_plan = (await db.execute(select(Plan))).scalars().first()
                if default_plan:
                    org.plan_id = default_plan.id

    if payload.subdomain:
        custom_dom_stmt = select(OrganizationCustomDomain).where(OrganizationCustomDomain.organization_id == org.id)
        dom_res = await db.execute(custom_dom_stmt)
        dom = dom_res.scalars().first()
        clean_sub = payload.subdomain.strip().lower()
        if not "." in clean_sub:
            clean_sub = f"{clean_sub}.nexusrag.app"
        if dom:
            dom.hostname = clean_sub
        else:
            existing_host_stmt = select(OrganizationCustomDomain).where(OrganizationCustomDomain.hostname == clean_sub)
            existing_host = (await db.execute(existing_host_stmt)).scalars().first()
            if not existing_host:
                db.add(OrganizationCustomDomain(organization_id=org.id, hostname=clean_sub, is_primary=True, verification_status="VERIFIED"))
            else:
                existing_host.organization_id = org.id

    await db.commit()
    await db.refresh(org)

    # Fetch active domains for response
    dom_stmt = select(Domain).where(Domain.organization_id == org.id, Domain.status == "ACTIVE")
    active_domains = (await db.execute(dom_stmt)).scalars().all()

    return {
        "id": str(org.id),
        "name": org.name,
        "slug": org.slug,
        "subdomain": org.custom_domains[0].hostname if org.custom_domains else f"{org.slug}.nexusrag.app",
        "status": org.status,
        "plan_id": str(org.plan_id) if org.plan_id else None,
        "plan_name": org.plan.name if org.plan else "Standard Plan",
        "plan": {
            "id": str(org.plan.id) if org.plan else str(org.plan_id or ""),
            "name": org.plan.name if org.plan else "Standard Plan",
            "slug": org.plan.slug if org.plan else "standard",
        } if org.plan else None,
        "domains": [
            {
                "id": str(d.id),
                "name": d.name,
                "slug": d.slug,
                "status": d.status,
                "description": d.description,
            }
            for d in active_domains
        ],
        "created_at": org.created_at.isoformat() if org.created_at else None,
    }


@router.post("/{org_id}/suspend")
async def suspend_organization(
    org_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Suspend an organization."""
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    org.status = "SUSPENDED"
    await db.commit()
    return {"message": f"Organization '{org.name}' suspended successfully"}


@router.post("/{org_id}/activate")
async def activate_organization(
    org_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Activate an organization."""
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    org.status = "ACTIVE"
    await db.commit()
    return {"message": f"Organization '{org.name}' activated successfully"}


@router.post("/{org_id}/approve")
async def approve_organization(
    org_id: str,
    db: AsyncSession = Depends(get_db),
    admin: PlatformAdmin = Depends(get_current_platform_admin),
):
    """
    Superadmin Approval Action:
    Approves organization, sets status to PENDING_SETUP/APPROVED, and generates one-time activation token.
    """
    org = await db.get(Organization, org_id)
    if not org or org.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    # Find the org admin user
    user_stmt = select(User).where(User.organization_id == org.id, User.is_org_admin == True)
    user_res = await db.execute(user_stmt)
    admin_user = user_res.scalars().first()
    if not admin_user:
        # Fallback to any first user
        user_res = await db.execute(select(User).where(User.organization_id == org.id))
        admin_user = user_res.scalars().first()

    if not admin_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No admin user found for this organization")

    org.status = "APPROVED"
    await db.commit()

    token = create_activation_token(
        organization_id=str(org.id),
        user_id=str(admin_user.id),
        organization_slug=org.slug,
    )

    activation_url = f"/activation?token={token}"

    await audit_service.log_event(
        db=db,
        action="ORGANIZATION_APPROVED",
        organization_id=str(org.id),
        actor_id=str(admin.id),
        resource_type="organization",
        resource_id=str(org.id),
        metadata={"org_name": org.name, "approved_by": admin.email},
    )

    return {
        "status": "APPROVED",
        "organization_id": str(org.id),
        "organization_slug": org.slug,
        "admin_email": admin_user.email,
        "activation_token": token,
        "activation_url": activation_url,
        "message": f"Organization '{org.name}' approved successfully.",
    }


@router.post("/{org_id}/reject")
async def reject_organization(
    org_id: str,
    db: AsyncSession = Depends(get_db),
    admin: PlatformAdmin = Depends(get_current_platform_admin),
):
    """
    Superadmin Reject Action:
    Rejects organization registration request.
    """
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    org.status = "REJECTED"
    await db.commit()

    await audit_service.log_event(
        db=db,
        action="ORGANIZATION_REJECTED",
        organization_id=str(org.id),
        actor_id=str(admin.id),
        resource_type="organization",
        resource_id=str(org.id),
        metadata={"org_name": org.name, "rejected_by": admin.email},
    )

    return {"status": "REJECTED", "message": f"Organization '{org.name}' has been rejected."}

