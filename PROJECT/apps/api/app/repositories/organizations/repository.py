from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.organization_models import Organization


class OrganizationRepository(BaseRepository[Organization]):
    def __init__(self, session: AsyncSession):
        super().__init__(Organization, session)

    async def get_by_slug(self, slug: str) -> Optional[Organization]:
        result = await self.session.execute(
            select(Organization).where(Organization.slug == slug.lower(), Organization.status != "DELETED")
        )
        return result.scalar_one_or_none()

    async def get_active_organizations(self) -> List[Organization]:
        result = await self.session.execute(
            select(Organization).where(Organization.status == "ACTIVE")
        )
        return list(result.scalars().all())
