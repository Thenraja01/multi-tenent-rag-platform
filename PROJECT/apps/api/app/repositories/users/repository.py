from typing import Optional, List
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.identity_models import User


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str, organization_id: Optional[uuid.UUID] = None) -> Optional[User]:
        stmt = select(User).where(User.email == email.lower(), User.deleted_at.is_(None))
        if organization_id:
            stmt = stmt.where(User.organization_id == organization_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_org(self, organization_id: uuid.UUID) -> List[User]:
        result = await self.session.execute(
            select(User).where(User.organization_id == organization_id, User.deleted_at.is_(None))
        )
        return list(result.scalars().all())
