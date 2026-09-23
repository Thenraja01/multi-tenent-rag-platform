import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.domains.it.infrastructure.models import ITTicket
from app.domains.it.schemas.schemas import ITTicketCreate


class ITApplicationService:
    @staticmethod
    async def create_ticket(session: AsyncSession, organization_id: str, user_id: str, data: ITTicketCreate) -> ITTicket:
        ticket = ITTicket(
            id=uuid.uuid4(),
            organization_id=uuid.UUID(str(organization_id)),
            creator_id=uuid.UUID(str(user_id)),
            title=data.title,
            description=data.description,
            priority=data.priority,
            category=data.category,
            status="OPEN",
        )
        session.add(ticket)
        await session.flush()
        return ticket
