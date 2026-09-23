from fastapi import HTTPException, status
from typing import Optional


class AuthorizationError(HTTPException):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_403_FORBIDDEN,
        request_id: Optional[str] = None,
    ):
        detail = {
            "error": {
                "code": code,
                "message": message,
                "request_id": request_id or "",
            }
        }
        super().__init__(status_code=status_code, detail=detail)


class TenantMismatchError(AuthorizationError):
    def __init__(self, message: str = "Access to requested tenant is forbidden", request_id: Optional[str] = None):
        super().__init__(code="TENANT_MISMATCH", message=message, status_code=status.HTTP_403_FORBIDDEN, request_id=request_id)


class DomainDisabledError(AuthorizationError):
    def __init__(self, domain_slug: str, request_id: Optional[str] = None):
        super().__init__(
            code="DOMAIN_DISABLED",
            message=f"Business domain '{domain_slug}' is not active or not provisioned for this organization.",
            status_code=status.HTTP_403_FORBIDDEN,
            request_id=request_id,
        )


class ModuleDisabledError(AuthorizationError):
    def __init__(self, module_slug: str, request_id: Optional[str] = None):
        super().__init__(
            code="MODULE_DISABLED",
            message=f"Module '{module_slug}' is not enabled in this domain workspace.",
            status_code=status.HTTP_403_FORBIDDEN,
            request_id=request_id,
        )


class PermissionDeniedError(AuthorizationError):
    def __init__(self, required_permission: str, request_id: Optional[str] = None):
        super().__init__(
            code="PERMISSION_DENIED",
            message=f"You do not possess the required permission ('{required_permission}') to perform this action.",
            status_code=status.HTTP_403_FORBIDDEN,
            request_id=request_id,
        )


class ScopeDeniedError(AuthorizationError):
    def __init__(self, required_scope: str, request_id: Optional[str] = None):
        super().__init__(
            code="SCOPE_DENIED",
            message=f"Resource access is outside of your permitted data scope ({required_scope}).",
            status_code=status.HTTP_403_FORBIDDEN,
            request_id=request_id,
        )
