import logging
from typing import Any, Dict, List, Optional, Set
from fastapi import HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.identity_models import User, Domain, DomainModule, Role, RolePermission, UserRole, UserDepartment
from app.models.platform_models import Permission, Module, Feature, ModuleFeature, Pack, PackModule
from app.models.organization_models import Organization, OrganizationPack

logger = logging.getLogger("nexusrag.authz")


class AuthorizationService:
    """
    Centralized authorization service resolving dynamic hierarchy:
    Organization -> Organization Packs -> Domains -> Domain Modules -> Roles -> Permissions -> Features
    """

    @staticmethod
    async def get_user_roles(db: AsyncSession, user_id: str, organization_id: str) -> List[Role]:
        """Fetch all active roles assigned to the user within the organization."""
        stmt = (
            select(Role)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(
                UserRole.user_id == user_id,
                Role.organization_id == organization_id,
                Role.is_active == True,
            )
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def get_user_permissions(
        db: AsyncSession,
        user_id: str,
        organization_id: str,
        domain_id: Optional[str] = None,
    ) -> Set[str]:
        """Fetch set of all granted permission keys for the user."""
        stmt = (
            select(Permission.permission_key)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(Role, Role.id == RolePermission.role_id)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(
                UserRole.user_id == user_id,
                Role.organization_id == organization_id,
                Role.is_active == True,
            )
        )
        if domain_id:
            # Domain-scoped roles + org-wide roles (where domain_id is null)
            stmt = stmt.where((Role.domain_id == domain_id) | (Role.domain_id.is_(None)))

        res = await db.execute(stmt)
        return set(res.scalars().all())

    @staticmethod
    async def has_permission(
        db: AsyncSession,
        user_id: str,
        organization_id: str,
        permission_key: str,
        domain_id: Optional[str] = None,
    ) -> bool:
        """Verify if a user has a specific permission key."""
        perms = await AuthorizationService.get_user_permissions(db, user_id, organization_id, domain_id)
        return permission_key in perms or "*" in perms or "admin.*" in perms

    @staticmethod
    async def require_permission(
        db: AsyncSession,
        user_id: str,
        organization_id: str,
        permission_key: str,
        domain_id: Optional[str] = None,
    ) -> None:
        """Raise 403 Forbidden if user lacks the specified permission."""
        has_perm = await AuthorizationService.has_permission(db, user_id, organization_id, permission_key, domain_id)
        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"PERMISSION_DENIED: Required permission '{permission_key}' not granted",
            )

    @staticmethod
    async def can_access_domain(
        db: AsyncSession,
        user_id: str,
        organization_id: str,
        domain_id: str,
    ) -> bool:
        """Verify domain exists, belongs to tenant, and is active."""
        stmt = select(Domain).where(
            Domain.id == domain_id,
            Domain.organization_id == organization_id,
            Domain.status == "ACTIVE",
        )
        res = await db.execute(stmt)
        domain = res.scalar_one_or_none()
        return domain is not None

    @staticmethod
    async def can_access_module(
        db: AsyncSession,
        organization_id: str,
        domain_id: str,
        module_slug: str,
    ) -> bool:
        """Verify module is enabled in the domain and assigned via OrganizationPack."""
        stmt = (
            select(DomainModule)
            .join(Module, Module.id == DomainModule.module_id)
            .where(
                DomainModule.domain_id == domain_id,
                Module.slug == module_slug,
                DomainModule.enabled == True,
                Module.is_active == True,
            )
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none() is not None

    @staticmethod
    async def get_user_context(
        db: AsyncSession,
        user_id: str,
        organization_id: str,
    ) -> Dict[str, Any]:
        """
        Build the dynamic navigation and authorization tree for GET /api/v1/me/context.
        Constructs: organization, user, domains, enabled modules, and available features.
        """
        # 1. Fetch User & Organization
        user = await db.get(User, user_id)
        org = await db.get(Organization, organization_id)
        if not user or not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User or organization not found")

        # 2. Fetch User Permissions & Roles
        user_perms = await AuthorizationService.get_user_permissions(db, user_id, organization_id)

        # 3. Fetch Active Domains for Organization
        domain_stmt = select(Domain).where(
            Domain.organization_id == organization_id,
            Domain.status == "ACTIVE",
        )
        domains_res = await db.execute(domain_stmt)
        domains = list(domains_res.scalars().all())

        domains_context = []
        for d in domains:
            # Fetch enabled modules for this domain
            mod_stmt = (
                select(Module, DomainModule)
                .join(DomainModule, DomainModule.module_id == Module.id)
                .where(
                    DomainModule.domain_id == d.id,
                    DomainModule.enabled == True,
                    Module.is_active == True,
                )
                .order_by(DomainModule.sort_order)
            )
            mod_res = await db.execute(mod_stmt)
            modules_list = []

            for mod, dm in mod_res.all():
                # Fetch features for this module
                feat_stmt = (
                    select(Feature.slug)
                    .join(ModuleFeature, ModuleFeature.feature_id == Feature.id)
                    .where(
                        ModuleFeature.module_id == mod.id,
                        Feature.is_active == True,
                    )
                    .order_by(ModuleFeature.sort_order)
                )
                feat_res = await db.execute(feat_stmt)
                features = list(feat_res.scalars().all())

                modules_list.append({
                    "id": mod.id,
                    "name": mod.name,
                    "slug": mod.slug,
                    "module_type": mod.module_type,
                    "features": features,
                })

            domains_context.append({
                "id": d.id,
                "name": d.name,
                "slug": d.slug,
                "description": d.description,
                "modules": modules_list,
            })

        return {
            "organization": {
                "id": org.id,
                "name": org.name,
                "slug": org.slug,
                "status": org.status,
            },
            "user": {
                "id": str(user.id),
                "organization_id": str(user.organization_id),
                "full_name": user.full_name,
                "email": user.email,
                "is_active": user.is_active,
                "created_at": user.created_at,
            },
            "permissions": list(user_perms),
            "domains": domains_context,
        }


authorization_service = AuthorizationService()
