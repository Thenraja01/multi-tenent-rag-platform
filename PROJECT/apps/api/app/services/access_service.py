import logging
from typing import Any, Dict, List, Optional, Set
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.identity_models import (
    User,
    Department,
    UserDepartment,
    Role,
    UserRole,
    RolePermission,
    UserPermission,
    Domain,
    DomainModule,
)
from app.models.organization_models import Organization, OrganizationPack
from app.models.platform_models import Module, Pack, PackModule, Permission, PlatformAdmin

logger = logging.getLogger("nexusrag.access_service")


class AccessService:
    """
    Centralized Single Source of Truth for User Access Evaluation.
    Resolves: Organization + Departments + Roles + Domains + Modules + Permissions + Overrides.
    """

    @staticmethod
    async def get_user_access(
        db: AsyncSession,
        user: User,
        target_organization_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Calculate complete effective access for a user or platform admin.
        """
        org_id = target_organization_id or user.organization_id

        # 1. SuperAdmin / Platform Admin check
        is_superadmin = (user.organization_id is None) and (user.is_org_admin or isinstance(user, PlatformAdmin))
        if is_superadmin:
            return await AccessService._get_superadmin_access(db, user)

        # 2. Fetch Organization
        org = await db.get(Organization, org_id) if org_id else None
        org_data = {
            "id": str(org.id) if org else None,
            "name": org.name if org else "Platform",
            "slug": org.slug if org else "default",
            "subdomain": org.slug if org else "default",
            "status": org.status if org else "ACTIVE",
        } if org else None

        # 3. Fetch User Departments (Preserving Multi-Department Array)
        ud_stmt = (
            select(Department.id, Department.name, Department.slug, UserDepartment.is_primary)
            .join(UserDepartment, UserDepartment.department_id == Department.id)
            .where(UserDepartment.user_id == user.id)
            .order_by(UserDepartment.is_primary.desc(), Department.name.asc())
        )
        ud_res = await db.execute(ud_stmt)
        departments = [
            {
                "id": str(d_id),
                "name": d_name,
                "slug": d_slug,
                "is_primary": bool(is_prim),
            }
            for d_id, d_name, d_slug, is_prim in ud_res.all()
        ]
        assigned_dept_slugs = {d["slug"].lower() for d in departments}

        # 4. Fetch User Roles (Preserving Multi-Role Array)
        ur_stmt = (
            select(Role.id, Role.name, Role.slug, Role.is_system)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user.id, Role.is_active == True)
        )
        ur_res = await db.execute(ur_stmt)
        roles = [
            {
                "id": str(r_id),
                "name": r_name,
                "slug": r_slug.lower(),
                "is_system": bool(r_is_sys),
            }
            for r_id, r_name, r_slug, r_is_sys in ur_res.all()
        ]
        role_ids = [r["id"] for r in roles]
        role_slugs = {r["slug"] for r in roles}

        # If user is_org_admin, ensure tenant_admin is recognized
        is_tenant_admin = user.is_org_admin or "tenant_admin" in role_slugs

        # 5. Calculate Effective Permissions via Deterministic Precedence:
        # Precedence: 1. Org Admin Explicit Management Perms / 2. Scoped Role Perms / 3. User ALLOW - User DENY
        role_permissions: Set[str] = set()
        
        if is_tenant_admin:
            # Grant explicit organizational governance permissions without bypass over unassigned sensitive business data
            role_permissions.update([
                "org.admin.access",
                "org.admin.control_center",
                "org.users.view",
                "org.users.create",
                "org.users.manage",
                "org.roles.view",
                "org.roles.manage",
                "org.departments.view",
                "org.departments.manage",
                "org.domains.view",
                "org.domains.manage",
                "org.modules.view",
                "org.modules.manage",
                "org.settings.view",
                "org.settings.manage",
                "org.audit.view",
                "documents.view",
                "documents.upload",
                "documents.approve",
                "nexus.chat",
                "knowledge.view",
                "knowledge.query",
            ])

        if role_ids:
            rp_stmt = (
                select(Permission.permission_key)
                .join(RolePermission, RolePermission.permission_id == Permission.id)
                .where(RolePermission.role_id.in_(role_ids))
            )
            rp_res = await db.execute(rp_stmt)
            for p_key in rp_res.scalars().all():
                p_lower = p_key.lower()
                # Department/Domain Scope Check:
                # If permission is domain-prefixed (e.g. "hr.attendance.read" or "finance.invoices.read")
                # and role is NOT tenant_admin, verify user belongs to that department
                parts = p_lower.split(".")
                domain_prefix = parts[0] if len(parts) > 1 else None
                if not domain_prefix or domain_prefix in assigned_dept_slugs or is_tenant_admin:
                    role_permissions.add(p_lower)

        # User UBAC Overrides
        ubac_stmt = (
            select(UserPermission.effect, Permission.permission_key)
            .join(Permission, Permission.id == UserPermission.permission_id)
            .where(UserPermission.user_id == user.id)
        )
        ubac_res = await db.execute(ubac_stmt)
        user_allows: Set[str] = set()
        user_denies: Set[str] = set()
        for effect, p_key in ubac_res.all():
            if effect.upper() == "DENY":
                user_denies.add(p_key.lower())
            elif effect.upper() == "ALLOW":
                user_allows.add(p_key.lower())

        effective_permissions = sorted(list((role_permissions | user_allows) - user_denies))

        # 6. Resolve Enabled Domains & Modules for Tenant
        domains = []
        modules = []
        if org_id:
            dom_stmt = select(Domain).where(
                or_(Domain.organization_id == org_id, Domain.organization_id.is_(None)),
                Domain.status == "ACTIVE",
            )
            dom_res = await db.execute(dom_stmt)
            for dom in dom_res.scalars().all():
                domains.append({
                    "id": str(dom.id),
                    "name": dom.name,
                    "slug": dom.slug,
                    "icon": "folder",
                })

            # Fetch modules from Organization Packs & Domain Modules
            mod_stmt = (
                select(Module)
                .join(PackModule, PackModule.module_id == Module.id)
                .join(OrganizationPack, OrganizationPack.pack_id == PackModule.pack_id)
                .where(OrganizationPack.organization_id == org_id, Module.is_active == True)
            )
            mod_res = await db.execute(mod_stmt)
            all_org_modules = mod_res.scalars().all()

            for m in all_org_modules:
                # Check if module is allowed for this user's department/permissions
                mod_domain = m.slug.split("_")[0] if "_" in m.slug else "general"
                is_accessible = (
                    is_tenant_admin
                    or mod_domain in assigned_dept_slugs
                    or f"{m.slug}:view" in effective_permissions
                    or f"{mod_domain}.view" in effective_permissions
                    or "*" in effective_permissions
                )
                modules.append({
                    "id": str(m.id),
                    "name": m.name,
                    "slug": m.slug,
                    "domain": mod_domain,
                    "enabled": is_accessible,
                    "required_permission": f"{m.slug}:view",
                })

        primary_dept = next((d for d in departments if d.get("is_primary")), (departments[0] if departments else None))

        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "name": user.full_name,
                "is_active": user.is_active,
                "status": getattr(user, "status", "ACTIVE") or ("ACTIVE" if user.is_active else "PENDING_APPROVAL"),
                "is_org_admin": is_tenant_admin,
                "is_superadmin": False,
            },
            "organization": org_data,
            "roles": roles,
            "departments": departments,
            "domains": domains,
            "modules": modules,
            "permissions": effective_permissions,
            "scopes": {
                "department_ids": [d["id"] for d in departments],
                "department_slugs": [d["slug"] for d in departments],
                "primary_department_slug": primary_dept["slug"] if primary_dept else None,
                "is_org_wide": is_tenant_admin,
            },
        }

    @staticmethod
    async def _get_superadmin_access(db: AsyncSession, user: Any) -> Dict[str, Any]:
        """SuperAdmin platform access profile."""
        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name or "Platform SuperAdmin",
                "name": user.full_name or "Platform SuperAdmin",
                "is_active": True,
                "status": "ACTIVE",
                "is_org_admin": True,
                "is_superadmin": True,
            },
            "organization": {
                "id": None,
                "name": "Global / Platform",
                "slug": "superadmin",
                "subdomain": "superadmin",
                "status": "ACTIVE",
            },
            "roles": [
                {
                    "id": None,
                    "name": "superadmin",
                    "slug": "superadmin",
                    "is_system": True,
                }
            ],
            "departments": [
                {
                    "id": "platform",
                    "name": "Platform Infrastructure",
                    "slug": "platform",
                    "is_primary": True,
                }
            ],
            "domains": [],
            "modules": [],
            "permissions": ["*"],
        }
