import logging
from typing import Dict, Optional, Set
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.identity_models import User
from app.services.permission_service import PermissionService

logger = logging.getLogger("nexusrag.data_scope_service")


class DataScopeService:
    """
    Centralized Data Scope Evaluation Service:
    Resolves whether a user's data access scope is SELF, DEPARTMENT, DOMAIN, or ORGANIZATION.
    """

    @staticmethod
    async def get_resource_scope(
        db: AsyncSession,
        user: User,
        resource_name: str,
        effective_permissions: Optional[Set[str]] = None,
    ) -> str:
        """
        Determines the scope for a given resource (e.g. attendance, leave, documents, users).
        """
        if user.is_org_admin:
            return "ORGANIZATION"

        if effective_permissions is None:
            effective_permissions = await PermissionService.get_effective_permissions(
                db=db,
                user_id=str(user.id),
                organization_id=str(user.organization_id) if user.organization_id else None,
            )

        if "*" in effective_permissions or f"{resource_name}:*" in effective_permissions or f"{resource_name}:manage" in effective_permissions or f"{resource_name}:admin" in effective_permissions:
            return "ORGANIZATION"

        # Special cases per resource
        if resource_name == "attendance":
            if "attendance:manage" in effective_permissions or "attendance:update" in effective_permissions:
                return "DEPARTMENT"
            if "attendance:view" in effective_permissions or "attendance:mark" in effective_permissions:
                return "SELF"

        elif resource_name == "leave":
            if "leave:approve" in effective_permissions or "leave:manage" in effective_permissions:
                return "DEPARTMENT"
            if "leave:view" in effective_permissions or "leave:create" in effective_permissions:
                return "SELF"

        elif resource_name == "documents":
            if "document:approve" in effective_permissions or "document:manage" in effective_permissions:
                return "ORGANIZATION"
            if "document:upload" in effective_permissions or "document:view" in effective_permissions:
                return "DEPARTMENT"

        elif resource_name == "users":
            if "user:view" in effective_permissions or "user:create" in effective_permissions:
                return "ORGANIZATION"

        elif resource_name in ("invoices", "invoice"):
            if "invoice:approve" in effective_permissions or "invoice:manage" in effective_permissions or "finance:manage" in effective_permissions:
                return "DEPARTMENT"
            if "invoice:view" in effective_permissions:
                return "DEPARTMENT"
            return "SELF"

        elif resource_name in ("expenses", "expense"):
            if "expense:approve" in effective_permissions or "expense:manage" in effective_permissions or "finance:manage" in effective_permissions:
                return "DEPARTMENT"
            if "expense:view" in effective_permissions or "expense:create" in effective_permissions:
                return "SELF"

        elif resource_name in ("budgets", "budget"):
            if "budget:manage" in effective_permissions or "budget:create" in effective_permissions:
                return "ORGANIZATION"
            if "budget:view" in effective_permissions:
                return "DEPARTMENT"

        elif resource_name in ("vendors", "vendor"):
            if "vendor:manage" in effective_permissions or "vendor:create" in effective_permissions or "finance:manage" in effective_permissions:
                return "ORGANIZATION"
            if "vendor:view" in effective_permissions:
                return "DEPARTMENT"

        return "SELF"

    @staticmethod
    async def get_all_data_scopes(
        db: AsyncSession,
        user: User,
    ) -> Dict[str, str]:
        """
        Calculates all active data scopes for workspace context.
        """
        effective_perms = await PermissionService.get_effective_permissions(
            db=db,
            user_id=str(user.id),
            organization_id=str(user.organization_id) if user.organization_id else None,
        )

        resources = ["attendance", "leave", "documents", "users", "roles", "domains", "ai", "finance", "invoices", "expenses", "budgets", "vendors"]
        scopes = {}
        for r in resources:
            scopes[r] = await DataScopeService.get_resource_scope(
                db=db,
                user=user,
                resource_name=r,
                effective_permissions=effective_perms,
            )

        return scopes


data_scope_service = DataScopeService()

