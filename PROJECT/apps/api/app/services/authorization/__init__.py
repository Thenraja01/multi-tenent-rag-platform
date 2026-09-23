from app.services.authorization.context import RequestContext
from app.services.authorization.resolver import ContextResolver, context_resolver
from app.services.authorization.scopes import ScopeResolver, scope_resolver
from app.services.authorization.service import AuthorizationService, authz_service, authorize, get_request_context
from app.services.authorization.cache import authz_cache
from app.services.authorization.exceptions import (
    AuthorizationError,
    TenantMismatchError,
    DomainDisabledError,
    ModuleDisabledError,
    PermissionDeniedError,
    ScopeDeniedError,
)

__all__ = [
    "RequestContext",
    "ContextResolver",
    "context_resolver",
    "ScopeResolver",
    "scope_resolver",
    "AuthorizationService",
    "authz_service",
    "authorize",
    "get_request_context",
    "authz_cache",
    "AuthorizationError",
    "TenantMismatchError",
    "DomainDisabledError",
    "ModuleDisabledError",
    "PermissionDeniedError",
    "ScopeDeniedError",
]
