from typing import Optional, Set
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.identity_models import UserPermission
from app.services.permission_service import PermissionService


class UBACService:
    """
    User-Based Access Control override engine.
    """

    @staticmethod
    async def get_effective_permissions(
        db: AsyncSession,
        user_id: str,
        organization_id: Optional[str] = None,
    ) -> Set[str]:
        return await PermissionService.get_effective_permissions(db, user_id, organization_id)


ubac_service = UBACService()
