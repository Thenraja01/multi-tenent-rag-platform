import logging
from typing import Optional, Dict, Any, Union
from fastapi import Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.services.authorization.context import RequestContext
from app.services.authorization.resolver import context_resolver
from app.services.authorization.scopes import scope_resolver
from app.services.authorization.exceptions import (
    PermissionDeniedError,
    ModuleDisabledError,
    ScopeDeniedError,
)

logger = logging.getLogger("nexusrag.authz.service")


class AuthorizationService:
    """
    Unified Central Authorization Engine for NexusRAG.
    Validates permissions, module access, and data scopes before any business execution.
    """

    @staticmethod
    async def get_request_context(
        request: Request,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> RequestContext:
        """FastAPI Dependency: Builds or retrieves cached RequestContext."""
        request_id = getattr(request.state, "request_id", None) or request.headers.get("x-request-id") or "REQ-API"
        tenant_slug = getattr(request.state, "organization_slug", None) or request.headers.get("x-tenant-slug")
        domain_slug = request.headers.get("x-domain-slug")

        context = await context_resolver.resolve_context(
            db=db,
            user=current_user,
            tenant_slug=tenant_slug,
            domain_slug=domain_slug,
            request_id=request_id,
        )
        request.state.authz_context = context
        return context

    @staticmethod
    def authorize(
        context: RequestContext,
        resource: str,
        action: str,
        module_slug: Optional[str] = None,
        resource_data: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Authorize access across Permission, Module, and Data Scope gates.
        Raises structured AuthorizationError if any gate fails.
        """
        if context.is_superadmin:
            return True

        # 1. Module Gate
        if module_slug and not context.is_module_allowed(module_slug):
            raise ModuleDisabledError(module_slug=module_slug, request_id=context.request_id)

        # 2. Permission Gate (RBAC + UBAC)
        perm_key = f"{resource}:{action}"
        if not context.has_permission(perm_key):
            raise PermissionDeniedError(required_permission=perm_key, request_id=context.request_id)

        # 3. Data Scope Gate
        if resource_data:
            scope_resolver.enforce_scope(context, resource_type=resource, resource_data=resource_data)

        return True


authz_service = AuthorizationService()
authorize = AuthorizationService.authorize
get_request_context = AuthorizationService.get_request_context
