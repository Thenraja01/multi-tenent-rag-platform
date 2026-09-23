from typing import Optional, List
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.knowledge_models import Document


class DocumentRepository(BaseRepository[Document]):
    def __init__(self, session: AsyncSession):
        super().__init__(Document, session)

    async def get_by_domain(self, domain_id: uuid.UUID, organization_id: uuid.UUID) -> List[Document]:
        result = await self.session.execute(
            select(Document).where(
                Document.domain_id == domain_id,
                Document.organization_id == organization_id,
                Document.deleted_at.is_(None)
            )
        )
        return list(result.scalars().all())

    async def get_by_status(self, status: str, organization_id: Optional[uuid.UUID] = None) -> List[Document]:
        stmt = select(Document).where(Document.status == status, Document.deleted_at.is_(None))
        if organization_id:
            stmt = stmt.where(Document.organization_id == organization_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
