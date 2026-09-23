import logging
from typing import Callable, Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.services.access_service import AccessService

logger = logging.getLogger("nexusrag.deps.authorization")


def require_permission(permission_key: str) -> Callable:
    """
    FastAPI dependency enforcing centralized permission check.
    Evaluates SuperAdmin, Organization Admin, Role Permissions, and User UBAC Overrides.
    """
    async def permission_checker(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        # Platform Superadmin wildcard bypass
        if not current_user.organization_id and current_user.is_org_admin:
            return current_user

        access_data = await AccessService.get_user_access(db, current_user)
        user_perms = access_data.get("permissions", [])

        p_key_lower = permission_key.lower().strip()
        has_perm = (
            "*" in user_perms
            or p_key_lower in user_perms
            or f"{p_key_lower.split(':')[0]}:*" in user_perms
            or f"{p_key_lower.split('.')[0]}.*" in user_perms
        )

        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"PERMISSION_DENIED: User lacks required permission '{permission_key}'",
            )

        return current_user

    return permission_checker


def require_role(allowed_roles: list[str]) -> Callable:
    """
    FastAPI dependency checking assigned canonical role slugs.
    """
    async def role_checker(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        if not current_user.organization_id and current_user.is_org_admin:
            return current_user

        access_data = await AccessService.get_user_access(db, current_user)
        user_roles = {r["slug"].lower() for r in access_data.get("roles", [])}

        allowed_lower = {r.lower() for r in allowed_roles}
        if not user_roles.intersection(allowed_lower) and not current_user.is_org_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"ROLE_DENIED: User requires one of roles: {', '.join(allowed_roles)}",
            )

        return current_user

    return role_checker
