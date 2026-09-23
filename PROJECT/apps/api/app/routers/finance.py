from datetime import datetime, date, timezone, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select, func, desc, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.models.finance_models import (
    Vendor,
    Invoice,
    Expense,
    Budget,
    Payment,
    FinancialReport,
)
from app.models.knowledge_models import Document
from app.services.rag_service import SecureRAGService
from app.services.audit_service import audit_service

router = APIRouter(prefix="/finance", tags=["Finance & Accounting Workflows"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class InvoiceCreate(BaseModel):
    vendor_name: str = Field(..., min_length=2, max_length=250)
    vendor_id: Optional[str] = None
    invoice_number: str = Field(..., min_length=1, max_length=100)
    invoice_date: Optional[date] = None
    due_date: date
    currency: Optional[str] = "INR"
    subtotal_amount: Decimal = Field(default=Decimal("0.0"))
    tax_amount: Decimal = Field(default=Decimal("0.0"))
    total_amount: Decimal = Field(..., gt=0)
    document_id: Optional[str] = None
    line_items: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None


class InvoiceApproval(BaseModel):
    action: str = Field(..., pattern="^(APPROVE|REJECT)$")
    notes: Optional[str] = None


class InvoiceStatusUpdate(BaseModel):
    payment_status: str = Field(..., pattern="^(PENDING|PAID|OVERDUE|CANCELLED)$")


class ExpenseCreate(BaseModel):
    employee_name: str = Field(..., min_length=2)
    department_id: Optional[str] = None
    title: str = Field(..., min_length=2, max_length=250)
    category: str = Field(default="General")
    amount: Decimal = Field(..., gt=0)
    currency: Optional[str] = "INR"
    expense_date: Optional[date] = None
    receipt_document_id: Optional[str] = None
    notes: Optional[str] = None


class ExpenseApproval(BaseModel):
    action: str = Field(..., pattern="^(APPROVE|REJECT)$")
    notes: Optional[str] = None


class BudgetCreate(BaseModel):
    department_name: str = Field(..., min_length=2)
    department_id: Optional[str] = None
    fiscal_year: str = Field(default="2025-2026")
    period: str = Field(default="ANNUAL")
    allocated_amount: Decimal = Field(..., gt=0)
    currency: Optional[str] = "INR"
    alert_threshold_pct: Decimal = Field(default=Decimal("80.0"))


class VendorCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=250)
    code: str = Field(..., min_length=2, max_length=100)
    tax_id: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    category: Optional[str] = "General"
    payment_terms_days: int = Field(default=30)
    contract_document_id: Optional[str] = None


class PaymentCreate(BaseModel):
    invoice_id: Optional[str] = None
    vendor_id: Optional[str] = None
    payment_type: str = Field(default="PAYABLE", pattern="^(PAYABLE|RECEIVABLE)$")
    customer_or_vendor_name: str = Field(..., min_length=2)
    amount: Decimal = Field(..., gt=0)
    currency: Optional[str] = "INR"
    payment_date: Optional[date] = None
    payment_method: str = Field(default="WIRE")
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class FinanceCopilotQuery(BaseModel):
    query: str = Field(..., min_length=2)
    category: Optional[str] = None


# ---------------------------------------------------------------------------
# 1. Finance Dashboard KPI & Trends
# ---------------------------------------------------------------------------

@router.get("/dashboard/stats")
async def get_finance_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregate high-level financial metrics, pending approvals, and budget alerts from database."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    # 1. Invoices stats
    inv_res = await db.execute(
        select(Invoice).where(Invoice.organization_id == org_id)
    )
    invoices = inv_res.scalars().all()
    
    total_invoiced = sum((inv.total_amount for inv in invoices), Decimal("0.0"))
    pending_invoices = [inv for inv in invoices if inv.approval_status == "PENDING"]
    overdue_invoices = [inv for inv in invoices if inv.payment_status == "OVERDUE"]
    paid_invoices = [inv for inv in invoices if inv.payment_status == "PAID"]
    outstanding_invoices = [inv for inv in invoices if inv.payment_status in ("PENDING", "OVERDUE")]
    outstanding_receivables = sum((inv.total_amount for inv in outstanding_invoices), Decimal("0.0"))

    # 2. Expenses stats
    exp_res = await db.execute(
        select(Expense).where(Expense.organization_id == org_id)
    )
    expenses = exp_res.scalars().all()
    total_expenses = sum((exp.amount for exp in expenses if exp.status in ["APPROVED", "REIMBURSED"]), Decimal("0.0"))
    pending_expenses = [exp for exp in expenses if exp.status == "PENDING"]

    # 3. Payments (Revenue vs Expenses)
    pmt_res = await db.execute(
        select(Payment).where(Payment.organization_id == org_id)
    )
    payments = pmt_res.scalars().all()
    total_revenue = sum((p.amount for p in payments if p.payment_type == "RECEIVABLE"), Decimal("0.0"))

    # 4. Budgets stats & alerts
    budget_res = await db.execute(
        select(Budget).where(Budget.organization_id == org_id, Budget.status == "ACTIVE")
    )
    budgets = budget_res.scalars().all()
    budget_alerts = []
    for b in budgets:
        utilization = float((b.spent_amount / b.allocated_amount) * 100) if b.allocated_amount > 0 else 0.0
        if utilization >= float(b.alert_threshold_pct):
            budget_alerts.append({
                "id": str(b.id),
                "department": b.department_name,
                "allocated": float(b.allocated_amount),
                "spent": float(b.spent_amount),
                "utilization_pct": round(utilization, 1),
                "currency": b.currency,
                "is_critical": utilization >= 90.0,
            })

    # Recent Invoices preview
    recent_invoices_data = [
        {
            "id": str(inv.id),
            "invoice_number": inv.invoice_number,
            "vendor_name": inv.vendor_name,
            "total_amount": float(inv.total_amount),
            "currency": inv.currency,
            "due_date": inv.due_date.isoformat() if inv.due_date else None,
            "payment_status": inv.payment_status,
            "approval_status": inv.approval_status,
        }
        for inv in sorted(invoices, key=lambda x: x.created_at or datetime.now(timezone.utc), reverse=True)[:5]
    ]

    net_profit = float(total_revenue - total_expenses)

    return {
        "kpis": {
            "total_revenue": float(total_revenue),
            "total_revenue_display": f"₹{float(total_revenue):,.2f}",
            "total_expenses": float(total_expenses),
            "total_expenses_display": f"₹{float(total_expenses):,.2f}",
            "net_profit": net_profit,
            "net_profit_display": f"₹{net_profit:,.2f}",
            "outstanding_receivables": float(outstanding_receivables),
            "outstanding_display": f"₹{float(outstanding_receivables):,.2f}",
            "pending_approvals_count": len(pending_invoices) + len(pending_expenses),
            "overdue_invoices_count": len(overdue_invoices),
        },
        "recent_invoices": recent_invoices_data,
        "pending_invoices_count": len(pending_invoices),
        "pending_expenses_count": len(pending_expenses),
        "budget_alerts": budget_alerts,
    }


# ---------------------------------------------------------------------------
# 2. Invoices Management & OCR Extraction
# ---------------------------------------------------------------------------

@router.get("/invoices")
async def list_invoices(
    status_filter: Optional[str] = Query(None, alias="status"),
    approval_filter: Optional[str] = Query(None, alias="approval"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List tenant invoices with vendor, tax, and approval workflow status."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")
    
    stmt = select(Invoice).where(Invoice.organization_id == org_id)
    if status_filter:
        stmt = stmt.where(Invoice.payment_status == status_filter.upper())
    if approval_filter:
        stmt = stmt.where(Invoice.approval_status == approval_filter.upper())
        
    stmt = stmt.order_by(desc(Invoice.created_at))
    res = await db.execute(stmt)
    invoices = res.scalars().all()

    return [
        {
            "id": str(inv.id),
            "vendor_id": str(inv.vendor_id) if inv.vendor_id else None,
            "vendor_name": inv.vendor_name,
            "invoice_number": inv.invoice_number,
            "invoice_date": inv.invoice_date.isoformat() if inv.invoice_date else None,
            "due_date": inv.due_date.isoformat() if inv.due_date else None,
            "currency": inv.currency,
            "subtotal_amount": float(inv.subtotal_amount or 0),
            "tax_amount": float(inv.tax_amount or 0),
            "total_amount": float(inv.total_amount or 0),
            "approval_status": inv.approval_status,
            "payment_status": inv.payment_status,
            "notes": inv.notes,
            "document_id": str(inv.document_id) if inv.document_id else None,
            "created_at": inv.created_at.isoformat() if inv.created_at else None,
        }
        for inv in invoices
    ]


@router.post("/invoices", status_code=status.HTTP_201_CREATED)
async def create_invoice(
    payload: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register and create an invoice manually or via OCR parser."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    invoice = Invoice(
        organization_id=org_id,
        vendor_id=payload.vendor_id,
        vendor_name=payload.vendor_name,
        invoice_number=payload.invoice_number,
        invoice_date=payload.invoice_date or date.today(),
        due_date=payload.due_date,
        currency=payload.currency or "INR",
        subtotal_amount=payload.subtotal_amount,
        tax_amount=payload.tax_amount,
        total_amount=payload.total_amount,
        document_id=payload.document_id,
        notes=payload.notes,
        approval_status="PENDING",
        payment_status="PENDING",
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)

    await audit_service.log_event(
        db=db,
        action="INVOICE_CREATED",
        organization_id=str(org_id),
        actor_id=str(current_user.id),
        resource_type="invoice",
        resource_id=str(invoice.id),
        metadata={"invoice_number": invoice.invoice_number, "total_amount": float(invoice.total_amount)},
    )

    return {
        "id": str(invoice.id),
        "invoice_number": invoice.invoice_number,
        "total_amount": float(invoice.total_amount),
        "approval_status": invoice.approval_status,
    }


@router.patch("/invoices/{invoice_id}/approve")
async def approve_or_reject_invoice(
    invoice_id: str,
    payload: InvoiceApproval,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manager/Admin approval for an invoice."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = select(Invoice).where(Invoice.id == invoice_id, Invoice.organization_id == org_id)
    inv = (await db.execute(stmt)).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    new_status = "APPROVED" if payload.action == "APPROVE" else "REJECTED"
    inv.approval_status = new_status
    inv.approved_by_id = current_user.id
    inv.approved_at = datetime.now(timezone.utc)
    if payload.notes:
        inv.notes = f"{inv.notes or ''}\n[Review Note]: {payload.notes}".strip()

    await db.commit()

    await audit_service.log_event(
        db=db,
        action=f"INVOICE_{new_status}",
        organization_id=str(org_id),
        actor_id=str(current_user.id),
        resource_type="invoice",
        resource_id=str(inv.id),
    )

    return {
        "id": str(inv.id),
        "invoice_number": inv.invoice_number,
        "approval_status": inv.approval_status,
    }


@router.patch("/invoices/{invoice_id}/status")
async def update_invoice_payment_status(
    invoice_id: str,
    payload: InvoiceStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update payment status of an invoice (PAID, OVERDUE, PENDING, CANCELLED)."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = select(Invoice).where(Invoice.id == invoice_id, Invoice.organization_id == org_id)
    inv = (await db.execute(stmt)).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    inv.payment_status = payload.payment_status
    await db.commit()

    return {
        "id": str(inv.id),
        "invoice_number": inv.invoice_number,
        "payment_status": inv.payment_status,
    }


# ---------------------------------------------------------------------------
# 3. Expenses Claims
# ---------------------------------------------------------------------------

@router.get("/expenses")
async def list_expenses(
    category_filter: Optional[str] = Query(None, alias="category"),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List organization employee expense claims and receipts."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = select(Expense).where(Expense.organization_id == org_id)

    if category_filter:
        stmt = stmt.where(Expense.category == category_filter)
    if status_filter:
        stmt = stmt.where(Expense.status == status_filter.upper())

    stmt = stmt.order_by(desc(Expense.created_at))
    res = await db.execute(stmt)
    expenses = res.scalars().all()

    return [
        {
            "id": str(exp.id),
            "employee_name": exp.employee_name,
            "title": exp.title,
            "category": exp.category,
            "amount": float(exp.amount),
            "currency": exp.currency,
            "expense_date": exp.expense_date.isoformat() if exp.expense_date else None,
            "status": exp.status,
            "receipt_document_id": str(exp.receipt_document_id) if exp.receipt_document_id else None,
            "notes": exp.notes,
            "created_at": exp.created_at.isoformat() if exp.created_at else None,
        }
        for exp in expenses
    ]


@router.post("/expenses", status_code=status.HTTP_201_CREATED)
async def submit_expense(
    payload: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit an employee expense claim."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    exp = Expense(
        organization_id=org_id,
        user_id=current_user.id,
        department_id=payload.department_id,
        employee_name=payload.employee_name,
        title=payload.title,
        category=payload.category,
        amount=payload.amount,
        currency=payload.currency or "INR",
        expense_date=payload.expense_date or date.today(),
        receipt_document_id=payload.receipt_document_id,
        notes=payload.notes,
        status="PENDING",
    )
    db.add(exp)
    await db.commit()
    await db.refresh(exp)

    return {
        "id": str(exp.id),
        "title": exp.title,
        "amount": float(exp.amount),
        "status": exp.status,
    }


@router.patch("/expenses/{expense_id}/approve")
async def approve_or_reject_expense(
    expense_id: str,
    payload: ExpenseApproval,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Approve or reject an expense claim."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = select(Expense).where(Expense.id == expense_id, Expense.organization_id == org_id)
    exp = (await db.execute(stmt)).scalar_one_or_none()
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense claim not found")

    new_status = "APPROVED" if payload.action == "APPROVE" else "REJECTED"
    exp.status = new_status
    exp.approved_by_id = current_user.id
    exp.approved_at = datetime.now(timezone.utc)
    if payload.notes:
        exp.notes = f"{exp.notes or ''}\n[Review Note]: {payload.notes}".strip()

    await db.commit()

    return {
        "id": str(exp.id),
        "status": exp.status,
        "approved_by_id": str(exp.approved_by_id),
    }


# ---------------------------------------------------------------------------
# 4. Budgets
# ---------------------------------------------------------------------------

@router.get("/budgets")
async def list_budgets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List department budget allocations and utilization."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = select(Budget).where(Budget.organization_id == org_id).order_by(Budget.department_name)
    res = await db.execute(stmt)
    budgets = res.scalars().all()

    return [
        {
            "id": str(b.id),
            "department_name": b.department_name,
            "department_id": str(b.department_id) if b.department_id else None,
            "fiscal_year": b.fiscal_year,
            "period": b.period,
            "allocated_amount": float(b.allocated_amount),
            "spent_amount": float(b.spent_amount),
            "currency": b.currency,
            "alert_threshold_pct": float(b.alert_threshold_pct),
            "utilization_pct": round(float((b.spent_amount / b.allocated_amount) * 100), 1) if b.allocated_amount > 0 else 0.0,
            "status": b.status,
        }
        for b in budgets
    ]


@router.post("/budgets", status_code=status.HTTP_201_CREATED)
async def create_or_update_budget(
    payload: BudgetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new department budget allocation."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    budget = Budget(
        organization_id=org_id,
        department_name=payload.department_name,
        department_id=payload.department_id,
        fiscal_year=payload.fiscal_year,
        period=payload.period,
        allocated_amount=payload.allocated_amount,
        spent_amount=Decimal("0.0"),
        currency=payload.currency or "INR",
        alert_threshold_pct=payload.alert_threshold_pct,
        status="ACTIVE",
    )
    db.add(budget)
    await db.commit()
    await db.refresh(budget)

    return {
        "id": str(budget.id),
        "department_name": budget.department_name,
        "allocated_amount": float(budget.allocated_amount),
    }


# ---------------------------------------------------------------------------
# 5. Vendors Management
# ---------------------------------------------------------------------------

@router.get("/vendors")
async def list_vendors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List registered suppliers and vendors."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = select(Vendor).where(Vendor.organization_id == org_id).order_by(Vendor.name)
    res = await db.execute(stmt)
    vendors = res.scalars().all()

    return [
        {
            "id": str(v.id),
            "name": v.name,
            "code": v.code,
            "tax_id": v.tax_id,
            "contact_person": v.contact_person,
            "email": v.email,
            "phone": v.phone,
            "category": v.category,
            "payment_terms_days": v.payment_terms_days,
            "status": v.status,
            "contract_document_id": str(v.contract_document_id) if v.contract_document_id else None,
        }
        for v in vendors
    ]


@router.post("/vendors", status_code=status.HTTP_201_CREATED)
async def create_vendor(
    payload: VendorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register a new vendor/supplier."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    vendor = Vendor(
        organization_id=org_id,
        name=payload.name,
        code=payload.code,
        tax_id=payload.tax_id,
        contact_person=payload.contact_person,
        email=payload.email,
        phone=payload.phone,
        category=payload.category,
        payment_terms_days=payload.payment_terms_days,
        contract_document_id=payload.contract_document_id,
        status="ACTIVE",
    )
    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)

    return {
        "id": str(vendor.id),
        "name": vendor.name,
        "code": vendor.code,
        "status": vendor.status,
    }


# ---------------------------------------------------------------------------
# 6. Payments & Receivables Aging
# ---------------------------------------------------------------------------

@router.get("/payments")
async def list_payments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List completed and scheduled payments."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = select(Payment).where(Payment.organization_id == org_id).order_by(desc(Payment.payment_date))
    res = await db.execute(stmt)
    payments = res.scalars().all()

    return [
        {
            "id": str(p.id),
            "invoice_id": str(p.invoice_id) if p.invoice_id else None,
            "vendor_id": str(p.vendor_id) if p.vendor_id else None,
            "payment_type": p.payment_type,
            "customer_or_vendor_name": p.customer_or_vendor_name,
            "amount": float(p.amount),
            "currency": p.currency,
            "payment_date": p.payment_date.isoformat() if p.payment_date else None,
            "payment_method": p.payment_method,
            "reference_number": p.reference_number,
            "status": p.status,
            "notes": p.notes,
        }
        for p in payments
    ]


@router.post("/payments", status_code=status.HTTP_201_CREATED)
async def record_payment(
    payload: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record a vendor or customer payment."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    p = Payment(
        organization_id=org_id,
        invoice_id=payload.invoice_id,
        vendor_id=payload.vendor_id,
        payment_type=payload.payment_type,
        customer_or_vendor_name=payload.customer_or_vendor_name,
        amount=payload.amount,
        currency=payload.currency or "INR",
        payment_date=payload.payment_date or date.today(),
        payment_method=payload.payment_method,
        reference_number=payload.reference_number,
        status="COMPLETED",
        notes=payload.notes,
    )
    db.add(p)

    if payload.invoice_id:
        inv = (await db.execute(select(Invoice).where(Invoice.id == payload.invoice_id, Invoice.organization_id == org_id))).scalar_one_or_none()
        if inv:
            inv.payment_status = "PAID"

    await db.commit()
    await db.refresh(p)

    return {
        "id": str(p.id),
        "amount": float(p.amount),
        "status": p.status,
    }


@router.get("/receivables/aging")
async def get_receivables_aging(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Calculate dynamic aging buckets for accounts receivables from unpaid invoices."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = select(Invoice).where(
        Invoice.organization_id == org_id,
        Invoice.payment_status.in_(["PENDING", "OVERDUE"]),
    )
    res = await db.execute(stmt)
    unpaid_invoices = res.scalars().all()

    today = date.today()
    bucket_0_30 = Decimal("0.0")
    bucket_31_60 = Decimal("0.0")
    bucket_61_90 = Decimal("0.0")
    bucket_90_plus = Decimal("0.0")

    count_0_30 = 0
    count_31_60 = 0
    count_61_90 = 0
    count_90_plus = 0

    top_overdue = []

    for inv in unpaid_invoices:
        days_past = (today - inv.due_date).days if inv.due_date else 0
        amt = inv.total_amount
        if days_past <= 30:
            bucket_0_30 += amt
            count_0_30 += 1
        elif days_past <= 60:
            bucket_31_60 += amt
            count_31_60 += 1
        elif days_past <= 90:
            bucket_61_90 += amt
            count_61_90 += 1
        else:
            bucket_90_plus += amt
            count_90_plus += 1
            top_overdue.append({
                "customer": inv.vendor_name,
                "amount": float(amt),
                "days_overdue": days_past,
                "invoice_no": inv.invoice_number,
            })

    total_outstanding = bucket_0_30 + bucket_31_60 + bucket_61_90 + bucket_90_plus

    return {
        "currency": "INR",
        "total_outstanding": float(total_outstanding),
        "total_display": f"₹{float(total_outstanding):,.2f}",
        "buckets": [
            {"label": "0–30 Days", "amount": float(bucket_0_30), "amount_display": f"₹{float(bucket_0_30):,.2f}", "count": count_0_30, "risk": "LOW"},
            {"label": "31–60 Days", "amount": float(bucket_31_60), "amount_display": f"₹{float(bucket_31_60):,.2f}", "count": count_31_60, "risk": "MEDIUM"},
            {"label": "61–90 Days", "amount": float(bucket_61_90), "amount_display": f"₹{float(bucket_61_90):,.2f}", "count": count_61_90, "risk": "HIGH"},
            {"label": "90+ Days (Overdue)", "amount": float(bucket_90_plus), "amount_display": f"₹{float(bucket_90_plus):,.2f}", "count": count_90_plus, "risk": "CRITICAL"},
        ],
        "top_overdue_customers": sorted(top_overdue, key=lambda x: x["days_overdue"], reverse=True)[:5],
    }


# ---------------------------------------------------------------------------
# 7. Financial Reports & Statements
# ---------------------------------------------------------------------------

@router.get("/reports")
async def list_financial_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregate executive financial summaries directly from verified transactions."""
    org_id = current_user.organization_id
    if not org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    # Aggregate total revenue from payments
    rev_res = await db.execute(
        select(func.coalesce(func.sum(Payment.amount), Decimal("0.0"))).where(
            Payment.organization_id == org_id,
            Payment.payment_type == "RECEIVABLE",
        )
    )
    total_rev = rev_res.scalar() or Decimal("0.0")

    # Aggregate total expenses
    exp_res = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), Decimal("0.0"))).where(
            Expense.organization_id == org_id,
            Expense.status.in_(["APPROVED", "REIMBURSED"]),
        )
    )
    total_exp = exp_res.scalar() or Decimal("0.0")

    net_profit = total_rev - total_exp
    margin = float((net_profit / total_rev) * 100) if total_rev > 0 else 0.0

    return {
        "profit_and_loss": {
            "title": f"Profit & Loss Summary ({datetime.now().year})",
            "currency": "INR",
            "revenue": float(total_rev),
            "operating_expenses": float(total_exp),
            "net_profit": float(net_profit),
            "net_profit_display": f"₹{float(net_profit):,.2f}",
            "net_margin_pct": round(margin, 2),
        },
        "cash_flow": {
            "title": f"Cash Flow Summary ({datetime.now().year})",
            "operating_cash_flow": float(total_rev - total_exp),
            "net_cash_flow": float(total_rev - total_exp),
            "net_cash_flow_display": f"₹{float(total_rev - total_exp):,.2f}",
        },
    }


# ---------------------------------------------------------------------------
# 8. Compliance & Policy Documents
# ---------------------------------------------------------------------------

@router.get("/compliance/policies")
async def get_finance_compliance_policies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns finance compliance documents and records indexed in knowledge base."""
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = select(Document).where(
        Document.organization_id == current_user.organization_id,
    ).order_by(desc(Document.created_at))
    res = await db.execute(stmt)
    docs = res.scalars().all()

    return [
        {
            "id": str(d.id),
            "title": d.filename,
            "filename": d.filename,
            "file_size": d.file_size,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in docs
    ]


# ---------------------------------------------------------------------------
# 9. Finance AI Copilot
# ---------------------------------------------------------------------------

@router.post("/chat")
async def query_finance_copilot(
    payload: FinanceCopilotQuery,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Finance AI Copilot with Domain-Scoped Knowledge Retrieval."""
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    rag_result = await SecureRAGService.answer_query(
        db=db,
        user_id=str(current_user.id),
        organization_id=str(current_user.organization_id),
        query_text=f"Finance Analysis & Accounting: {payload.query}",
        top_k=5,
    )

    await audit_service.log_event(
        db=db,
        action="FINANCE_AI_COPILOT_QUERY",
        organization_id=str(current_user.organization_id),
        actor_id=str(current_user.id),
        resource_type="finance_rag",
        metadata={"query": payload.query},
    )

    return {
        "query": payload.query,
        "answer": rag_result.get("answer"),
        "citations": rag_result.get("citations", []),
        "model": rag_result.get("model"),
    }
