"""
Centralized Authorization Models:
Exposes atomic RBAC & UBAC models (Role, RolePermission, UserRole, UserPermission, Permission).
"""
from app.models.identity_models import (
    Role,
    RolePermission,
    UserRole,
    UserPermission,
)
from app.models.platform_models import (
    Permission,
)

__all__ = [
    "Role",
    "RolePermission",
    "UserRole",
    "UserPermission",
    "Permission",
]
