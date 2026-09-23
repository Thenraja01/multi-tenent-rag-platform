from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.domains.finance.schemas.schemas import InvoiceCreate, InvoiceResponse, ExpenseCreate
from app.domains.finance.application.services import FinanceApplicationService

router = APIRouter(prefix="/finance", tags=["Finance & Accounting Workflows"])


@router.post("/invoices", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    data: InvoiceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    inv = await FinanceApplicationService.create_invoice(db, str(current_user.organization_id), data)
    await db.commit()
    return inv


@router.post("/expenses", status_code=status.HTTP_201_CREATED)
async def submit_expense(
    data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    exp = await FinanceApplicationService.submit_expense(db, str(current_user.organization_id), str(current_user.id), data)
    await db.commit()
    return {"message": "Expense submitted successfully", "id": str(exp.id)}
