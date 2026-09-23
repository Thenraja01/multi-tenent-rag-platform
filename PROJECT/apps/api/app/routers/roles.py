import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, delete, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User, Role, RolePermission
from app.models.platform_models import Permission
from app.services.audit_service import audit_service

router = APIRouter(prefix="/roles", tags=["Roles & RBAC"])


def is_valid_uuid(val: Optional[str]) -> bool:
    if not val:
        return False
    try:
        uuid.UUID(str(val).strip())
        return True
    except (ValueError, AttributeError, TypeError):
        return False


class RoleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: Optional[str] = None
    domain_id: Optional[str] = None
    organization_id: Optional[str] = None
    scope: Optional[str] = "platform"
    description: Optional[str] = None
    permission_keys: List[str] = Field(default_factory=list)


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permission_keys: Optional[List[str]] = None


@router.get("")
async def list_roles(
    organization_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all available system and organization roles with their assigned permission keys (deduplicated)."""
    target_org_id = current_user.organization_id or organization_id

    if target_org_id:
        stmt = (
            select(Role)
            .where(
                or_(
                    Role.organization_id == target_org_id,
                    Role.organization_id.is_(None),
                ),
                Role.is_active == True,
            )
            .order_by(Role.is_system.desc(), Role.name.asc())
        )
    else:
        # Platform level: return all active global system roles and custom tenant roles
        stmt = select(Role).where(Role.is_active == True).order_by(Role.is_system.desc(), Role.name.asc())

    res = await db.execute(stmt)
    roles = res.scalars().all()

    CANONICAL_NAME_MAP = {
        "org_admin": "Organization Administrator",
        "tenant_admin": "Organization Administrator",
        "department_admin": "Department Admin",
        "manager": "Manager",
        "support": "Support Specialist",
        "emp": "Employee",
        "employee": "Employee",
    }

    TIER_LEVEL_MAP = {
        "org_admin": (1, "Level 1 — Organization Administrator", 1),
        "tenant_admin": (1, "Level 1 — Organization Administrator", 1),
        "department_admin": (2, "Level 2 — Department Admin", 2),
        "hr_admin": (2, "Level 2 — Department Admin", 2),
        "finance_admin": (2, "Level 2 — Department Admin", 2),
        "manager": (3, "Level 3 — Department Manager", 3),
        "hr_manager": (3, "Level 3 — Department Manager", 3),
        "finance_manager": (3, "Level 3 — Department Manager", 3),
        "emp": (4, "Level 4 — Department Employee", 4),
        "employee": (4, "Level 4 — Department Employee", 4),
        "hr_employee": (4, "Level 4 — Department Employee", 4),
        "finance_employee": (4, "Level 4 — Department Employee", 4),
        "support": (4, "Level 4 — Department Support", 5),
    }

    # Deduplicate roles by canonical key (normalizing tenant_admin -> org_admin, filtering out superadmin)
    seen_canonical_keys = set()
    unique_roles = []
    
    for r in roles:
        slug_low = (r.slug or "").lower()
        if slug_low in ("superadmin", "super_admin"):
            continue
        canon_slug = "org_admin" if slug_low == "tenant_admin" else slug_low
        key = (r.organization_id, canon_slug)
        if key not in seen_canonical_keys:
            seen_canonical_keys.add(key)
            unique_roles.append(r)

    # Fetch permissions for all returned roles
    role_ids = [r.id for r in unique_roles]
    role_perms_map: Dict[str, List[str]] = {}
    if role_ids:
        rp_stmt = (
            select(RolePermission.role_id, Permission.permission_key)
            .join(Permission, RolePermission.permission_id == Permission.id)
            .where(RolePermission.role_id.in_(role_ids))
        )
        rp_res = await db.execute(rp_stmt)
        for r_id, p_key in rp_res.all():
            role_perms_map.setdefault(str(r_id), []).append(p_key)

    def format_role_info(role: Role):
        slug_low = (role.slug or "").lower()
        if slug_low in TIER_LEVEL_MAP:
            t_lvl, t_lbl, order = TIER_LEVEL_MAP[slug_low]
            return t_lvl, t_lbl, order, CANONICAL_NAME_MAP.get(slug_low, role.name)
        if role.name and role.name.lower() in CANONICAL_NAME_MAP:
            name_low = role.name.lower()
            t_lvl, t_lbl, order = TIER_LEVEL_MAP.get(name_low, (3, f"Level 3 — {role.name}", 99))
            return t_lvl, t_lbl, order, CANONICAL_NAME_MAP[name_low]
        return 3, f"Level 3 — {role.name}", 99, role.name

    result = []
    for r in unique_roles:
        t_lvl, t_lbl, order, clean_name = format_role_info(r)
        result.append({
            "id": str(r.id),
            "name": clean_name,
            "slug": r.slug,
            "tier_level": t_lvl,
            "tier_label": t_lbl,
            "sort_order": order,
            "description": r.description,
            "domain_id": str(r.domain_id) if r.domain_id else None,
            "organization_id": str(r.organization_id) if r.organization_id else None,
            "is_system": r.is_system or r.organization_id is None,
            "is_active": r.is_active,
            "permission_keys": role_perms_map.get(str(r.id), ["*"] if r.slug in ("superadmin", "super_admin", "org_admin", "tenant_admin") else []),
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })

    result.sort(key=lambda x: x["sort_order"])
    return result


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_role(
    payload: RoleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a custom RBAC role (SuperAdmin creates global/org roles; Org Admin creates tenant roles)."""
    slug_val = (payload.slug or payload.name).strip().lower().replace(" ", "_")
    target_org_id = payload.organization_id if current_user.organization_id is None else current_user.organization_id

    existing = await db.execute(
        select(Role).where(
            Role.organization_id == target_org_id,
            Role.slug == slug_val,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role slug '{slug_val}' already exists",
        )

    role = Role(
        organization_id=target_org_id,
        domain_id=payload.domain_id if is_valid_uuid(payload.domain_id) else None,
        name=payload.name.strip(),
        slug=slug_val,
        description=payload.description,
        is_system=(target_org_id is None or payload.scope == "platform"),
        is_active=True,
    )
    db.add(role)
    await db.flush()

    assigned_keys = []
    if payload.permission_keys:
        perms_res = await db.execute(
            select(Permission).where(Permission.permission_key.in_(payload.permission_keys))
        )
        for p in perms_res.scalars().all():
            db.add(RolePermission(role_id=role.id, permission_id=p.id))
            assigned_keys.append(p.permission_key)

    await db.commit()
    await db.refresh(role)

    await audit_service.log_event(
        db=db,
        action="ROLE_CREATED",
        organization_id=str(target_org_id) if target_org_id else None,
        actor_id=str(current_user.id),
        resource_type="role",
        resource_id=str(role.id),
        metadata={"name": role.name, "slug": role.slug},
    )

    return {
        "id": str(role.id),
        "name": role.name,
        "slug": role.slug,
        "description": role.description,
        "is_system": role.is_system,
        "is_active": role.is_active,
        "permission_keys": assigned_keys,
        "created_at": role.created_at.isoformat() if role.created_at else None,
    }


@router.get("/{role_id}")
async def get_role(
    role_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve role details with permission list."""
    conditions = [Role.slug == role_id]
    if is_valid_uuid(role_id):
        conditions.append(Role.id == role_id)

    stmt = select(Role).where(or_(*conditions))
    res = await db.execute(stmt)
    role = res.scalars().first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    rp_stmt = (
        select(Permission.permission_key)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(RolePermission.role_id == role.id)
    )
    rp_res = await db.execute(rp_stmt)
    perms = list(rp_res.scalars().all())

    return {
        "id": str(role.id),
        "name": role.name,
        "slug": role.slug,
        "description": role.description,
        "is_system": role.is_system,
        "is_active": role.is_active,
        "permission_keys": perms or (["*"] if role.slug in ("super_admin", "org_admin") else []),
        "created_at": role.created_at.isoformat() if role.created_at else None,
    }


@router.put("/{role_id}")
async def update_role(
    role_id: str,
    payload: RoleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update role details and assigned permission keys."""
    conditions = [Role.slug == role_id]
    if is_valid_uuid(role_id):
        conditions.append(Role.id == role_id)

    stmt = select(Role).where(or_(*conditions))
    res = await db.execute(stmt)
    role = res.scalars().first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    if payload.name:
        role.name = payload.name
    if payload.description is not None:
        role.description = payload.description

    if payload.permission_keys is not None:
        await db.execute(delete(RolePermission).where(RolePermission.role_id == role.id))
        perms_res = await db.execute(
            select(Permission).where(Permission.permission_key.in_(payload.permission_keys))
        )
        for p in perms_res.scalars().all():
            db.add(RolePermission(role_id=role.id, permission_id=p.id))

    await db.commit()
    await db.refresh(role)
    return {"id": str(role.id), "name": role.name, "status": "UPDATED"}


@router.delete("/{role_id}")
async def delete_role(
    role_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a custom role."""
    conditions = [Role.slug == role_id]
    if is_valid_uuid(role_id):
        conditions.append(Role.id == role_id)

    stmt = select(Role).where(or_(*conditions))
    res = await db.execute(stmt)
    role = res.scalars().first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    if role.is_system:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="System roles cannot be deleted")

    await db.delete(role)
    await db.commit()
    return {"message": "Role deleted successfully"}
