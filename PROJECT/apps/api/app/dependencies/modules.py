from typing import Callable
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.services.permission_service import PermissionService


def require_module(module_slug: str) -> Callable:
    """
    FastAPI dependency enforcing that the tenant has activated the given module.
    """
    async def module_dependency(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        if not current_user.organization_id:
            return current_user

        from app.services.authorization.module_service import module_service
        allowed = await module_service.get_allowed_modules(
            db=db,
            user_id=str(current_user.id),
            organization_id=str(current_user.organization_id),
        )
        allowed_slugs = {m.slug for m in allowed}
        universal = {"ai", "documents", "nexus", "dashboard", "users", "roles", "departments", "settings"}
        if module_slug not in allowed_slugs and module_slug not in universal:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"MODULE_DISABLED: Module '{module_slug}' is not active for this organization",
            )
        return current_user

    return module_dependency
