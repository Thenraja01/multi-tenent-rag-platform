from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.domains.legal.schemas.schemas import LegalContractCreate
from app.domains.legal.application.services import LegalApplicationService

router = APIRouter(prefix="/legal", tags=["Legal & Contracts Management"])


@router.post("/contracts", status_code=status.HTTP_201_CREATED)
async def create_contract(
    data: LegalContractCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    contract = await LegalApplicationService.process_contract(db, str(current_user.organization_id), data)
    return contract
