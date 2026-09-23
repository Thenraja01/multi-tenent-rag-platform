import logging
from typing import Optional, Set, List, Dict, Any
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.identity_models import User, Domain, Role, UserRole, UserPermission, RolePermission, Department, UserDepartment
from app.models.organization_models import Organization, OrganizationPack
from app.models.platform_models import Pack, Module, PackModule, Permission
from app.services.authorization.context import RequestContext
from app.services.authorization.cache import authz_cache
from app.services.authorization.exceptions import (
    TenantMismatchError,
    DomainDisabledError,
    AuthorizationError,
)

logger = logging.getLogger("nexusrag.authz.resolver")


class ContextResolver:
    """
    Central 5-Tier Authorization Context Builder & Policy Evaluator.
    Resolves Tenant -> Pack -> Domain -> Module -> RBAC/UBAC -> Scopes into a cached RequestContext.
    """

    @staticmethod
    async def resolve_context(
        db: AsyncSession,
        user: User,
        tenant_slug: Optional[str] = None,
        domain_slug: Optional[str] = None,
        request_id: str = "REQ-DEFAULT",
    ) -> RequestContext:
        user_id = str(user.id)
        org_id = str(user.organization_id) if user.organization_id else None

        # 1. SuperAdmin Short-Circuit
        if not org_id:
            all_mod_res = await db.execute(select(Module.slug).where(Module.is_active == True))
            all_mods = [m.lower() for m in all_mod_res.scalars().all()]
            return RequestContext(
                request_id=request_id,
                user_id=user_id,
                email=user.email,
                tenant_id=None,
                tenant_slug="superadmin",
                domain_id=None,
                domain_slug=domain_slug,
                is_superadmin=True,
                is_org_admin=True,
                roles=["super_admin"],
                permissions={"*"},
                allowed_modules=all_mods,
                data_scopes={
                    "attendance": "GLOBAL",
                    "leave": "GLOBAL",
                    "documents": "GLOBAL",
                    "users": "GLOBAL",
                    "invoices": "GLOBAL",
                    "expenses": "GLOBAL",
                },
            )

        # 2. Check Cache
        cached_data = authz_cache.get(tenant_id=org_id, user_id=user_id, domain_id=domain_slug)
        if cached_data:
            return RequestContext(
                request_id=request_id,
                user_id=user_id,
                email=user.email,
                tenant_id=org_id,
                tenant_slug=cached_data.get("tenant_slug"),
                domain_id=cached_data.get("domain_id"),
                domain_slug=cached_data.get("domain_slug"),
                department_id=cached_data.get("department_id"),
                department_slug=cached_data.get("department_slug"),
                pack_id=cached_data.get("pack_id"),
                pack_slug=cached_data.get("pack_slug"),
                is_superadmin=False,
                is_org_admin=cached_data.get("is_org_admin", user.is_org_admin),
                roles=cached_data.get("roles", []),
                permissions=set(cached_data.get("permissions", [])),
                allowed_modules=cached_data.get("allowed_modules", []),
                data_scopes=cached_data.get("data_scopes", {}),
            )

        # 3. Layer 1: Tenant Gate
        org_res = await db.execute(
            select(Organization).where(Organization.id == str(org_id))
        )
        org = org_res.scalars().first()
        if not org or org.deleted_at is not None or (org.status and org.status.upper() != "ACTIVE"):
            raise TenantMismatchError(
                message="Tenant organization is inactive, suspended, or does not exist.",
                request_id=request_id,
            )

        if tenant_slug and org.slug != tenant_slug.strip().lower():
            raise TenantMismatchError(
                message=f"User organization does not match requested tenant '{tenant_slug}'.",
                request_id=request_id,
            )

        # 4. Layer 2: Pack Gate & Allowed Modules
        pack_stmt = (
            select(Pack)
            .join(OrganizationPack, OrganizationPack.pack_id == Pack.id)
            .where(
                OrganizationPack.organization_id == org.id,
                OrganizationPack.is_active == True,
                Pack.is_active == True,
            )
        )
        pack_res = await db.execute(pack_stmt)
        active_packs = pack_res.scalars().all()
        primary_pack = active_packs[0] if active_packs else None

        # Fetch catalog modules associated with tenant's packs
        mod_stmt = (
            select(Module.slug)
            .join(PackModule, PackModule.module_id == Module.id)
            .join(OrganizationPack, OrganizationPack.pack_id == PackModule.pack_id)
            .where(
                OrganizationPack.organization_id == org.id,
                OrganizationPack.is_active == True,
                Module.is_active == True,
            )
        )
        mod_res = await db.execute(mod_stmt)
        allowed_modules = [m.lower() for m in mod_res.scalars().all()]
        if not allowed_modules:
            # Fallback to standard core modules
            all_core = (await db.execute(select(Module.slug).where(Module.is_active == True))).scalars().all()
            allowed_modules = [m.lower() for m in all_core]

        # 5. Layer 3: Domain Gate
        target_domain_id = None
        target_domain_slug = None
        if domain_slug:
            clean_dom = domain_slug.strip().lower()
            dom_stmt = select(Domain).where(
                Domain.organization_id == org.id,
                Domain.slug == clean_dom,
            )
            dom_res = await db.execute(dom_stmt)
            matched_dom = dom_res.scalars().first()
            if not matched_dom or matched_dom.status != "ACTIVE":
                raise DomainDisabledError(domain_slug=clean_dom, request_id=request_id)
            target_domain_id = str(matched_dom.id)
            target_domain_slug = matched_dom.slug

        # 6. Primary Department
        dept_stmt = (
            select(Department)
            .join(UserDepartment, UserDepartment.department_id == Department.id)
            .where(UserDepartment.user_id == user.id)
            .order_by(UserDepartment.is_primary.desc())
        )
        dept_res = await db.execute(dept_stmt)
        primary_dept = dept_res.scalars().first()
        dept_id = str(primary_dept.id) if primary_dept else None
        dept_slug = primary_dept.slug if primary_dept else None

        # 7. Layer 4: RBAC & UBAC Permissions Resolution
        # A. Fetch Role Permissions
        ur_stmt = (
            select(Role)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user.id)
        )
        ur_res = await db.execute(ur_stmt)
        user_roles = ur_res.scalars().all()
        role_slugs = [r.slug for r in user_roles]
        role_ids = [r.id for r in user_roles]

        is_admin_user = bool(
            user.is_org_admin
            or user.is_superadmin
            or any("admin" in (r.slug or "").lower() or "admin" in (r.name or "").lower() for r in user_roles)
        )

        effective_perms: Set[str] = set()
        # Default baseline permissions for authenticated tenant members
        effective_perms.add("document:view")
        effective_perms.add("document:upload")
        effective_perms.add("attendance:view")
        effective_perms.add("attendance:create")
        effective_perms.add("leave:view")
        effective_perms.add("leave:create")

        if is_admin_user:
            effective_perms.add("*")
            effective_perms.add("admin.*")
            effective_perms.add("document:*")
            effective_perms.add("document:upload")
            effective_perms.add("document:view")
            effective_perms.add("document:approve")
            effective_perms.add("document:delete")
            effective_perms.add("employee:*")
            effective_perms.add("attendance:*")
            effective_perms.add("leave:*")
            effective_perms.add("invoice:*")
            effective_perms.add("expense:*")
            effective_perms.add("budget:*")

        if role_ids:
            rp_stmt = (
                select(Permission.permission_key)
                .join(RolePermission, RolePermission.permission_id == Permission.id)
                .where(RolePermission.role_id.in_(role_ids))
            )
            rp_res = await db.execute(rp_stmt)
            for p in rp_res.scalars().all():
                effective_perms.add(p)

        # B. Fetch User-Specific UBAC Overrides (ALLOW & DENY)
        ubac_stmt = (
            select(Permission.permission_key, UserPermission.effect)
            .join(UserPermission, UserPermission.permission_id == Permission.id)
            .where(UserPermission.user_id == user.id)
        )
        ubac_res = await db.execute(ubac_stmt)
        for perm_key, effect in ubac_res.all():
            if effect == "ALLOW":
                effective_perms.add(perm_key)
            elif effect == "DENY":
                # Explicit DENY precedence
                effective_perms.discard(perm_key)

        # 8. Layer 5: Data Scopes
        data_scopes = {
            "leave": "ORGANIZATION" if is_admin_user else ("DEPARTMENT" if any("manager" in r.lower() for r in role_slugs) else "SELF"),
            "attendance": "ORGANIZATION" if is_admin_user else ("DEPARTMENT" if any("manager" in r.lower() for r in role_slugs) else "SELF"),
            "documents": "ORGANIZATION" if is_admin_user else "DOMAIN",
            "users": "ORGANIZATION" if is_admin_user else "DEPARTMENT",
            "invoices": "ORGANIZATION" if is_admin_user else "DEPARTMENT",
            "expenses": "ORGANIZATION" if is_admin_user else "SELF",
        }

        # 9. Save to Cache
        cache_payload = {
            "tenant_slug": org.slug,
            "domain_id": target_domain_id,
            "domain_slug": target_domain_slug,
            "department_id": dept_id,
            "department_slug": dept_slug,
            "pack_id": str(primary_pack.id) if primary_pack else None,
            "pack_slug": primary_pack.slug if primary_pack else "enterprise",
            "is_org_admin": is_admin_user,
            "roles": role_slugs,
            "permissions": list(effective_perms),
            "allowed_modules": allowed_modules,
            "data_scopes": data_scopes,
        }
        authz_cache.set(tenant_id=org_id, user_id=user_id, domain_id=domain_slug, data=cache_payload)

        return RequestContext(
            request_id=request_id,
            user_id=user_id,
            email=user.email,
            tenant_id=org_id,
            tenant_slug=org.slug,
            domain_id=target_domain_id,
            domain_slug=target_domain_slug,
            department_id=dept_id,
            department_slug=dept_slug,
            pack_id=str(primary_pack.id) if primary_pack else None,
            pack_slug=primary_pack.slug if primary_pack else "enterprise",
            is_superadmin=False,
            is_org_admin=is_admin_user,
            roles=role_slugs,
            permissions=effective_perms,
            allowed_modules=allowed_modules,
            data_scopes=data_scopes,
        )


context_resolver = ContextResolver()
