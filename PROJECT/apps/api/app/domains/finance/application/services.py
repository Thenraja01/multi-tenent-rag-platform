import uuid
from decimal import Decimal
from datetime import date
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.domains.finance.infrastructure.models import Invoice, Expense
from app.domains.finance.schemas.schemas import InvoiceCreate, ExpenseCreate


class FinanceApplicationService:
    @staticmethod
    async def create_invoice(session: AsyncSession, organization_id: str, data: InvoiceCreate) -> Invoice:
        inv = Invoice(
            id=uuid.uuid4(),
            organization_id=uuid.UUID(str(organization_id)),
            vendor_name=data.vendor_name,
            invoice_number=data.invoice_number,
            invoice_date=data.invoice_date or date.today(),
            due_date=data.due_date,
            currency=data.currency or "INR",
            subtotal_amount=data.subtotal_amount,
            tax_amount=data.tax_amount,
            total_amount=data.total_amount,
            document_id=uuid.UUID(data.document_id) if data.document_id else None,
            line_items=data.line_items or [],
            notes=data.notes,
            approval_status="PENDING",
            payment_status="PENDING",
        )
        session.add(inv)
        await session.flush()
        return inv

    @staticmethod
    async def submit_expense(session: AsyncSession, organization_id: str, user_id: str, data: ExpenseCreate) -> Expense:
        exp = Expense(
            id=uuid.uuid4(),
            organization_id=uuid.UUID(str(organization_id)),
            user_id=uuid.UUID(str(user_id)),
            employee_name=data.employee_name,
            department_id=uuid.UUID(data.department_id) if data.department_id else None,
            title=data.title,
            category=data.category,
            amount=data.amount,
            receipt_document_id=uuid.UUID(data.receipt_document_id) if data.receipt_document_id else None,
            notes=data.notes,
            status="PENDING",
        )
        session.add(exp)
        await session.flush()
        return exp
