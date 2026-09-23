import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User, Domain, DomainModule, Department, Role, RolePermission, UserRole, UserDepartment
from app.models.organization_models import Organization, OrganizationPack
from app.models.platform_models import Module, Pack, PackModule, Permission
from app.models.knowledge_models import Document
from app.core.seeder import load_seed_data
from app.services.permission_service import PermissionService
from app.services.data_scope_service import DataScopeService
from app.services.dashboard_service import DashboardService


def is_valid_uuid(val: Optional[str]) -> bool:
    if not val:
        return False
    try:
        uuid.UUID(str(val).strip())
        return True
    except (ValueError, AttributeError, TypeError):
        return False


def get_module_metadata_map() -> Dict[str, Dict[str, Any]]:
    """Load module metadata (icons, routes, default permissions) from seed.json."""
    seed = load_seed_data()
    mod_map = {}
    for m in seed.get("modules", []):
        slug = m.get("slug")
        if slug:
            mod_map[slug] = {
                "icon": m.get("icon", "box"),
                "route": m.get("route", f"/{slug}"),
                "default_permission": m.get("default_permission", "*"),
            }
    return mod_map


router = APIRouter(tags=["Navigation & Dynamic Modules"])


@router.get("/me/modules")
@router.get("/navigation")
@router.get("/navigation/context")
async def get_my_modules(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Dynamic Module Resolution Engine:
    Resolves enabled modules from Organization Packs and checks user's effective permissions.
    """
    mod_meta = get_module_metadata_map()
    org_id = current_user.organization_id
    if not org_id:
        # Platform Admin / SuperAdmin without tenant organization
        mod_res = await db.execute(select(Module).where(Module.is_active == True))
        all_modules = mod_res.scalars().all()
        return {
            "organization": {
                "id": "platform",
                "name": "Platform Administration",
                "slug": "superadmin",
            },
            "modules": [
                {
                    "id": str(m.id),
                    "name": m.name,
                    "slug": m.slug,
                    "icon": mod_meta.get(m.slug, {}).get("icon", "box"),
                    "route": mod_meta.get(m.slug, {}).get("route", f"/{m.slug}"),
                    "required_permission": mod_meta.get(m.slug, {}).get("default_permission", "*"),
                    "permissions": ["view", "create", "edit", "delete", "admin"],
                }
                for m in all_modules
            ],
        }

    # Fetch Organization
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    # 1. Fetch modules from Organization's Assigned Packs
    pack_stmt = (
        select(Module)
        .join(PackModule, PackModule.module_id == Module.id)
        .join(OrganizationPack, OrganizationPack.pack_id == PackModule.pack_id)
        .where(
            OrganizationPack.organization_id == org_id,
            OrganizationPack.is_active == True,
            Module.is_active == True,
        )
    )
    pack_res = await db.execute(pack_stmt)
    pack_modules = list(pack_res.scalars().all())

    # Fallback modules if none specifically bound
    if not pack_modules:
        all_m = (await db.execute(select(Module).where(Module.is_active == True))).scalars().all()
        pack_modules = list(all_m)

    # 2. Fetch User's Effective Permissions (RBAC + UBAC)
    effective_perms = await PermissionService.get_effective_permissions(
        db=db,
        user_id=str(current_user.id),
        organization_id=str(org_id),
    )
    is_admin = "*" in effective_perms or current_user.is_org_admin

    modules_output = []
    for m in pack_modules:
        meta = mod_meta.get(m.slug, {})
        req_perm = meta.get("default_permission", "*")
        # If permission required and user lacks it, do not expose module
        if req_perm != "*" and not is_admin and req_perm not in effective_perms:
            continue

        matching_perms = [p for p in effective_perms if p == req_perm or p.startswith(f"{m.module_type}:") or p.startswith(f"{m.slug}:")]
        if not matching_perms:
            matching_perms = ["view"]

        modules_output.append({
            "id": str(m.id),
            "name": m.name,
            "slug": m.slug,
            "icon": meta.get("icon", "box"),
            "route": meta.get("route", f"/{m.slug}"),
            "required_permission": req_perm,
            "permissions": matching_perms if not is_admin else ["view", "create", "edit", "delete", "admin"],
        })

    return {
        "organization": {
            "id": str(org.id),
            "name": org.name,
            "slug": org.slug,
        },
        "modules": modules_output,
    }


@router.get("/runtime")
@router.get("/workspace/context")
async def get_workspace_context(
    department: Optional[str] = None,
    tenant: Optional[str] = None,
    context_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns verified Runtime context for Department Apps & Organization Control Plane:
    - If department is specified: verifies department existence & user membership (enforcing 403 on non-members).
    - If organization admin: returns organization-wide governance context.
    - Yields dynamic modules, effective permissions, capabilities, and data scopes.
    """
    mod_meta = get_module_metadata_map()
    org_id = current_user.organization_id
    is_super = getattr(current_user, "is_superadmin", False) or (org_id is None)

    if (not org_id or is_super) and tenant and tenant.strip().lower() not in ("superadmin", "platform", "admin"):
        clean_tenant = tenant.strip().lower()
        t_stmt = select(Organization.id).where(
            or_(
                Organization.slug == clean_tenant,
                Organization.id == clean_tenant if is_valid_uuid(clean_tenant) else False,
            ),
            Organization.deleted_at.is_(None),
        )
        t_res = await db.execute(t_stmt)
        found_org_id = t_res.scalars().first()
        if found_org_id:
            org_id = found_org_id

    if not org_id:
        mod_res = await db.execute(select(Module).where(Module.is_active == True))
        all_modules = mod_res.scalars().all()
        packs_res = await db.execute(select(Pack).where(Pack.is_active == True))
        all_packs = packs_res.scalars().all()

        total_users = (await db.scalar(select(func.count(User.id)))) or 0
        total_storage = (await db.scalar(select(func.coalesce(func.sum(Document.file_size), 0)))) or 0

        return {
            "context": "PLATFORM",
            "workspace": {
                "type": "platform",
                "landing_route": "/superadmin",
            },
            "tenant": {
                "id": "platform",
                "name": "Platform Administration",
                "slug": "superadmin",
            },
            "department": None,
            "organization": {
                "id": "platform",
                "name": "Platform Administration",
                "slug": "superadmin",
                "subdomain": "superadmin.localfix.app",
                "status": "ACTIVE",
            },
            "domains": [],
            "packs": [{"id": str(p.id), "name": p.name, "slug": p.slug} for p in all_packs],
            "modules": [
                {
                    "id": str(m.id),
                    "slug": m.slug,
                    "name": m.name,
                    "icon": mod_meta.get(m.slug, {}).get("icon", "box"),
                    "route": mod_meta.get(m.slug, {}).get("route", f"/{m.slug}"),
                    "required_permission": mod_meta.get(m.slug, {}).get("default_permission", "*"),
                    "enabled": True,
                }
                for m in all_modules
            ],
            "user": {
                "id": str(current_user.id),
                "email": current_user.email,
                "full_name": current_user.full_name,
                "is_superadmin": True,
                "is_org_admin": True,
                "role": "superadmin",
                "department": None,
            },
            "memberships": [],
            "roles": [{"id": "r_sa", "name": "superadmin", "slug": "superadmin"}],
            "permissions": ["*"],
            "capabilities": {
                "rag": True,
                "workflows": True,
                "webhooks": True,
                "api_keys": True,
                "custom_domains": True,
                "ai_providers": ["ollama", "openai", "gemini"],
            },
            "feature_flags": {
                "advanced_rag": True,
                "workflow_builder": True,
                "beta_leave_ui": False,
                "external_ai": True,
            },
            "quotas": {
                "max_users": 99999,
                "used_users": total_users,
                "max_storage_bytes": 1099511627776,
                "used_storage_bytes": int(total_storage),
                "monthly_ai_tokens": 100000000,
                "used_ai_tokens": 0,
            },
            "data_scopes": {},
            "plan": {"id": "unlimited", "name": "Superadmin Unlimited", "slug": "unlimited"},
        }

    # Fetch Organization with relations
    org_stmt = (
        select(Organization)
        .options(
            selectinload(Organization.plan),
            selectinload(Organization.custom_domains),
            selectinload(Organization.domains),
        )
        .where(Organization.id == org_id)
    )
    org_res = await db.execute(org_stmt)
    org = org_res.scalars().first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    # 1. Fetch Organization Active Packs
    pack_stmt = (
        select(Pack)
        .join(OrganizationPack, OrganizationPack.pack_id == Pack.id)
        .where(
            OrganizationPack.organization_id == org_id,
            OrganizationPack.is_active == True,
            Pack.is_active == True,
        )
    )
    pack_res = await db.execute(pack_stmt)
    active_packs = list(pack_res.scalars().all())

    # 2. Fetch modules from Organization's Assigned Packs
    pack_mod_stmt = (
        select(Module)
        .join(PackModule, PackModule.module_id == Module.id)
        .join(OrganizationPack, OrganizationPack.pack_id == PackModule.pack_id)
        .where(
            OrganizationPack.organization_id == org_id,
            OrganizationPack.is_active == True,
            Module.is_active == True,
        )
    )
    pack_mod_res = await db.execute(pack_mod_stmt)
    pack_modules = list(pack_mod_res.scalars().all())

    if not pack_modules:
        all_m = (await db.execute(select(Module).where(Module.is_active == True))).scalars().all()
        pack_modules = list(all_m)

    # 3. Fetch User's Roles
    ur_stmt = (
        select(Role)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == current_user.id)
    )
    ur_res = await db.execute(ur_stmt)
    user_roles = list(ur_res.scalars().all())
    roles_data = [{"id": str(r.id), "name": r.name, "slug": r.slug} for r in user_roles]

    # 4. Fetch User's Department Memberships
    ud_stmt = (
        select(Department, UserDepartment.is_primary, Role.name.label("role_name"))
        .join(UserDepartment, UserDepartment.department_id == Department.id)
        .outerjoin(Role, and_(Role.organization_id == org_id, Role.slug == f"{Department.slug}-manager"))
        .where(UserDepartment.user_id == current_user.id)
    )
    ud_res = await db.execute(ud_stmt)
    user_memberships = []
    primary_dept_data = None
    for row in ud_res.all():
        dept_item = row[0]
        is_prim = row[1]
        m_role = row[2] or "Member"
        entry = {
            "department_id": str(dept_item.id),
            "department_name": dept_item.name,
            "department_slug": dept_item.slug,
            "role": m_role,
            "is_primary": is_prim,
        }
        user_memberships.append(entry)
        if is_prim and not primary_dept_data:
            primary_dept_data = {"id": str(dept_item.id), "name": dept_item.name}

    if not primary_dept_data and user_memberships:
        primary_dept_data = {"id": user_memberships[0]["department_id"], "name": user_memberships[0]["department_name"]}

    # 5. Calculate Effective Permissions (RBAC + UBAC)
    if is_super:
        effective_perms = {"*"}
        roles_data = [{"id": "r_sa", "name": "Super Admin", "slug": "super_admin"}]
        primary_role_name = "Super Admin"
    else:
        effective_perms = await PermissionService.get_effective_permissions(
            db=db,
            user_id=str(current_user.id),
            organization_id=str(org_id),
        )
        primary_role_name = (user_roles[0].slug if user_roles else ("tenant_admin" if current_user.is_org_admin else "emp")).lower()

    # 6. Department Validation & Membership Gate (Enforce 403 on Non-Members)
    resolved_dept_data = None
    resolved_context = "ORGANIZATION" if (current_user.is_org_admin or is_super or context_type == "ORGANIZATION") else "WORKSPACE"

    if department:
        clean_dept = department.strip().lower()
        dept_stmt = select(Domain).where(Domain.organization_id == org_id, Domain.slug == clean_dept)
        dept_obj = (await db.execute(dept_stmt)).scalars().first()
        if not dept_obj:
            d_stmt = select(Department).where(Department.organization_id == org_id, Department.slug == clean_dept)
            dept_obj = (await db.execute(d_stmt)).scalars().first()

        if not dept_obj or (hasattr(dept_obj, 'status') and dept_obj.status == "DISABLED"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Department '{department}' is not active or not provisioned for this organization.",
            )

        is_admin = current_user.is_org_admin or is_super or "*" in effective_perms
        is_member = any(m["department_slug"] == clean_dept for m in user_memberships)

        if not is_admin and not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: You are not an authorized member of the '{dept_obj.name}' department.",
            )

        resolved_dept_data = {
            "id": str(dept_obj.id),
            "slug": dept_obj.slug,
            "name": dept_obj.name,
        }
        resolved_context = "DEPARTMENT"

    # 7. Calculate Data Scopes
    data_scopes = await DataScopeService.get_all_data_scopes(db, current_user)

    # 8. Calculate live tenant usage counts
    tenant_users_count = (await db.scalar(select(func.count(User.id)).where(User.organization_id == org_id))) or 0
    tenant_storage_bytes = (await db.scalar(select(func.coalesce(func.sum(Document.file_size), 0)).where(Document.organization_id == org_id))) or 0

    # 9. Format domains list
    domains_data = [
        {
            "id": str(d.id),
            "name": d.name,
            "slug": d.slug,
            "status": "active" if d.status == "ACTIVE" else d.status.lower(),
            "description": d.description,
            "modules": [],
            "departments": [],
        }
        for d in (org.domains or [])
    ]

    # Deduplicate and format modules
    seen_mod_slugs = set()
    formatted_modules = []
    for m in pack_modules:
        if m.slug in seen_mod_slugs:
            continue
        seen_mod_slugs.add(m.slug)
        meta = mod_meta.get(m.slug, {})
        formatted_modules.append({
            "id": str(m.id),
            "slug": m.slug,
            "name": m.name,
            "category": getattr(m, "module_type", "core"),
            "icon": meta.get("icon", "box"),
            "route": meta.get("route", f"/{m.slug}"),
            "required_permission": meta.get("default_permission", "*"),
            "enabled": True,
        })

    return {
        "context": resolved_context,
        "workspace": {
            "type": "organization_admin" if (current_user.is_org_admin or is_super) else "member",
            "landing_route": "/dashboard" if (current_user.is_org_admin or is_super) else "/nexus",
        },
        "tenant": {
            "id": str(org.id),
            "name": org.name,
            "slug": org.slug,
        },
        "department": resolved_dept_data,
        "organization": {
            "id": str(org.id),
            "name": org.name,
            "slug": org.slug,
            "subdomain": org.custom_domains[0].hostname if org.custom_domains else f"{org.slug}.localhost:3000",
            "status": org.status,
        },
        "domains": domains_data,
        "packs": [{"id": str(p.id), "name": p.name, "slug": p.slug} for p in active_packs],
        "modules": formatted_modules,
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "is_superadmin": is_super,
            "is_org_admin": current_user.is_org_admin or is_super,
            "role": primary_role_name,
            "department": primary_dept_data,
        },
        "memberships": user_memberships,
        "roles": roles_data,
        "permissions": list(effective_perms),
        "capabilities": {
            "rag": True,
            "workflows": True,
            "webhooks": True,
            "api_keys": True,
            "custom_domains": True,
            "ai_providers": ["ollama", "openai"],
        },
        "feature_flags": {
            "advanced_rag": True,
            "workflow_builder": True,
            "beta_leave_ui": False,
            "external_ai": False,
        },
        "quotas": {
            "max_users": org.plan.max_users if org.plan and org.plan.max_users else 500,
            "used_users": tenant_users_count,
            "max_storage_bytes": org.plan.max_storage_bytes if org.plan and org.plan.max_storage_bytes else 107374182400,
            "used_storage_bytes": int(tenant_storage_bytes),
            "monthly_ai_tokens": org.plan.max_ai_tokens if org.plan and org.plan.max_ai_tokens else 5000000,
            "used_ai_tokens": 0,
        },
        "data_scopes": data_scopes,
        "plan": {
            "id": str(org.plan_id) if org.plan_id else "enterprise",
            "name": org.plan.name if org.plan else "Enterprise Plan",
            "slug": org.plan.slug if org.plan else "enterprise",
        },
    }


@router.get("/workspace/dashboard")
async def get_workspace_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Dynamic Dashboard API:
    Returns the dynamic cards, metrics, and scopes tailored to user's effective permissions and organization's active packs.
    """
    dashboard_payload = await DashboardService.get_dashboard_cards(db, current_user)
    return dashboard_payload
