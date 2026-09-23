import logging
from typing import Any, Callable, Dict, List, Optional, Set
from fastapi import Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.identity_models import User, Role, RolePermission, UserRole, UserPermission
from app.models.platform_models import Permission

logger = logging.getLogger("nexusrag.permission_service")


class PermissionService:
    """
    Centralized Permission & UBAC Evaluation Service:
    Deterministic Precedence:
        Explicit User DENY -> Explicit User ALLOW -> Role Permission -> No Permission
    """

    @staticmethod
    async def get_effective_permissions(
        db: AsyncSession,
        user_id: str,
        organization_id: Optional[str] = None,
        domain_id: Optional[str] = None,
    ) -> Set[str]:
        """
        Calculate effective permissions for a user across roles and user-level overrides.
        """
        user = await db.get(User, user_id)
        if not user or not user.is_active:
            return set()

        # 1. Fetch Role Permissions
        role_stmt = (
            select(Permission.permission_key)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(Role, Role.id == RolePermission.role_id)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(
                UserRole.user_id == user_id,
                Role.is_active == True,
            )
        )
        if organization_id:
            role_stmt = role_stmt.where(
                (Role.organization_id == organization_id) | (Role.organization_id.is_(None))
            )
        if domain_id:
            role_stmt = role_stmt.where(
                (Role.domain_id == domain_id) | (Role.domain_id.is_(None))
            )

        role_res = await db.execute(role_stmt)
        role_permissions: Set[str] = set(role_res.scalars().all())

        # If org admin, base role perms get wildcard unless explicitly denied
        if user.is_org_admin:
            role_permissions.add("*")

        # 2. Fetch UBAC (User Permission Overrides)
        ubac_stmt = (
            select(UserPermission, Permission.permission_key)
            .join(Permission, Permission.id == UserPermission.permission_id)
            .where(UserPermission.user_id == user_id)
        )
        ubac_res = await db.execute(ubac_stmt)
        ubac_records = ubac_res.all()

        user_allows: Set[str] = set()
        user_denies: Set[str] = set()

        for up, perm_key in ubac_records:
            if up.effect.upper() == "DENY":
                user_denies.add(perm_key)
            elif up.effect.upper() == "ALLOW":
                user_allows.add(perm_key)

        # 3. Apply Deterministic Precedence:
        # Effective = (Role Permissions + User ALLOW) - User DENY
        effective_permissions = (role_permissions | user_allows) - user_denies

        return effective_permissions

    @staticmethod
    async def has_permission(
        db: AsyncSession,
        user_id: str,
        organization_id: Optional[str] = None,
        permission_key: str = "",
        domain_id: Optional[str] = None,
    ) -> bool:
        """
        Check if a user has a specific permission key after evaluating RBAC and UBAC.
        """
        effective_perms = await PermissionService.get_effective_permissions(
            db, user_id, organization_id, domain_id
        )
        if "*" in effective_perms or "admin.*" in effective_perms:
            return True
        return permission_key in effective_perms

    @staticmethod
    async def require_permission(
        db: AsyncSession,
        user_id: str,
        organization_id: Optional[str],
        permission_key: str,
        domain_id: Optional[str] = None,
    ) -> None:
        """
        Raise 403 Forbidden if the user lacks the required permission.
        """
        allowed = await PermissionService.has_permission(
            db=db,
            user_id=user_id,
            organization_id=organization_id,
            permission_key=permission_key,
            domain_id=domain_id,
        )
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"PERMISSION_DENIED: Required permission '{permission_key}' not granted",
            )


permission_service = PermissionService()


def require_permission(permission_code: str) -> Callable:
    """
    FastAPI dependency enforcing atomic permission check.
    """
    from app.dependencies.auth import get_current_user

    async def permission_dependency(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        await PermissionService.require_permission(
            db=db,
            user_id=str(current_user.id),
            organization_id=str(current_user.organization_id) if current_user.organization_id else None,
            permission_key=permission_code,
        )
        return current_user

    return permission_dependency
