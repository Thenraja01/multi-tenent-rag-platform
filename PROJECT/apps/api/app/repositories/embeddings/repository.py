from typing import Optional, List
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.knowledge_models import DocumentChunk


class EmbeddingRepository(BaseRepository[DocumentChunk]):
    def __init__(self, session: AsyncSession):
        super().__init__(DocumentChunk, session)

    async def get_by_document(self, document_id: uuid.UUID) -> List[DocumentChunk]:
        result = await self.session.execute(
            select(DocumentChunk).where(DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index)
        )
        return list(result.scalars().all())
