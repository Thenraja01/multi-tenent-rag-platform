from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.identity_models import User
from app.services.authorization_service import AuthorizationService


class ContextService:
    @staticmethod
    async def get_workspace_context(
        db: AsyncSession,
        user: User,
        organization_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        return await AuthorizationService.get_user_context(
            db=db,
            user_id=str(user.id),
            organization_id=str(organization_id or user.organization_id),
        )


context_service = ContextService()
