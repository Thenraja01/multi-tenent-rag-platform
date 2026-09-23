from typing import Any, Optional, Dict
from fastapi import HTTPException, status


class NexusException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(
            status_code=status_code,
            detail={"code": code, "message": message, "details": self.details},
        )


class AuthenticationError(NexusException):
    def __init__(self, message: str = "Authentication required or invalid token.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="AUTHENTICATION_REQUIRED",
            message=message,
            details=details,
        )

UnauthorizedException = AuthenticationError


class AuthorizationError(NexusException):
    def __init__(self, message: str = "You do not have permission to perform this action.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            message=message,
            details=details,
        )

ForbiddenException = AuthorizationError


class TenantContextError(NexusException):
    def __init__(self, message: str = "Invalid or missing tenant/organization context.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="TENANT_CONTEXT_MISSING",
            message=message,
            details=details,
        )


class DomainContextError(NexusException):
    def __init__(self, message: str = "Invalid or missing domain context.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="DOMAIN_CONTEXT_MISSING",
            message=message,
            details=details,
        )


class ModuleNotEnabledError(NexusException):
    def __init__(self, module_key: str, domain_name: Optional[str] = None):
        domain_str = f" for domain '{domain_name}'" if domain_name else ""
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="MODULE_NOT_ENABLED",
            message=f"Module '{module_key}' is not enabled{domain_str}.",
            details={"module": module_key, "domain": domain_name},
        )

ModuleDisabledException = ModuleNotEnabledError


class ResourceNotFoundError(NexusException):
    def __init__(self, message: str = "Requested resource was not found.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=message,
            details=details,
        )

NotFoundException = ResourceNotFoundError


class ConflictError(NexusException):
    def __init__(self, message: str = "Resource conflict occurred.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="CONFLICT",
            message=message,
            details=details,
        )

ConflictException = ConflictError


class StorageError(NexusException):
    def __init__(self, message: str = "Object storage operation failed.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="STORAGE_ERROR",
            message=message,
            details=details,
        )


class ProcessingError(NexusException):
    def __init__(self, message: str = "Document or background processing failed.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="PROCESSING_FAILED",
            message=message,
            details=details,
        )


class QuotaExceededError(NexusException):
    def __init__(self, message: str = "Storage or processing quota exceeded.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            code="QUOTA_EXCEEDED",
            message=message,
            details=details,
        )


class TenantSuspendedException(NexusException):
    def __init__(self, organization_name: Optional[str] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="TENANT_SUSPENDED",
            message="This organization account is suspended. Please contact platform administration.",
            details={"organization": organization_name},
        )
