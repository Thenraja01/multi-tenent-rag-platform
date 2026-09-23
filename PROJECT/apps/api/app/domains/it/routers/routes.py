from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.domains.it.schemas.schemas import ITTicketCreate, ITTicketResponse
from app.domains.it.application.services import ITApplicationService

router = APIRouter(prefix="/it", tags=["IT Operations & Ticketing"])


@router.post("/tickets", response_model=ITTicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    data: ITTicketCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ticket = await ITApplicationService.create_ticket(db, str(current_user.organization_id), str(current_user.id), data)
    await db.commit()
    return ticket
