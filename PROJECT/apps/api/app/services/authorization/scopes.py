from typing import Any, Optional, Dict
from app.services.authorization.context import RequestContext
from app.services.authorization.exceptions import ScopeDeniedError


class ScopeResolver:
    """
    Evaluates resource-level data scopes (SELF, DEPARTMENT, DOMAIN, TENANT, GLOBAL)
    against the active RequestContext.
    """

    @staticmethod
    def evaluate_scope(
        context: RequestContext,
        resource_type: str,
        resource_data: Optional[Dict[str, Any]] = None,
    ) -> bool:
        if context.is_superadmin:
            return True

        # Default allowed scope for this resource type
        allowed_scope = context.data_scopes.get(resource_type.lower(), "SELF").upper()

        if allowed_scope == "GLOBAL" and context.is_superadmin:
            return True

        if allowed_scope in ["TENANT", "ORGANIZATION"]:
            # Organization-level scope: user can access all records within tenant
            if resource_data and ("organization_id" in resource_data or "tenant_id" in resource_data):
                t_id = resource_data.get("organization_id") or resource_data.get("tenant_id")
                return str(t_id) == str(context.tenant_id)
            return True

        if allowed_scope == "DOMAIN":
            # Domain-level scope: user can access all records within their domain workspace
            if resource_data and "domain_id" in resource_data and context.domain_id:
                return str(resource_data["domain_id"]) == str(context.domain_id)
            return True

        if allowed_scope == "DEPARTMENT":
            # Department-level scope: user can access all records in their department
            if resource_data and "department_id" in resource_data and context.department_id:
                return str(resource_data["department_id"]) == str(context.department_id)
            return True

        if allowed_scope == "SELF":
            # Self-level scope: user can only access their own records
            if resource_data:
                owner_id = resource_data.get("user_id") or resource_data.get("employee_id") or resource_data.get("actor_id")
                if owner_id:
                    return str(owner_id) == str(context.user_id)
            return True

        return False

    @classmethod
    def enforce_scope(
        cls,
        context: RequestContext,
        resource_type: str,
        resource_data: Optional[Dict[str, Any]] = None,
    ) -> bool:
        if not cls.evaluate_scope(context, resource_type, resource_data):
            allowed_scope = context.data_scopes.get(resource_type.lower(), "SELF")
            raise ScopeDeniedError(required_scope=allowed_scope, request_id=context.request_id)
        return True


scope_resolver = ScopeResolver()
