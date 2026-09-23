import uuid
from datetime import datetime, date, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Date,
    Numeric,
    DateTime,
    ForeignKey,
    JSON,
    UniqueConstraint,
    Integer,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base


class Vendor(Base):
    __tablename__ = "vendors"
    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_vendor_org_code"),
        {"extend_existing": True},
    )

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(250), nullable=False, index=True)
    code = Column(String(100), nullable=False, index=True)
    tax_id = Column(String(100), nullable=True)  # GST / VAT / Tax ID
    contact_person = Column(String(150), nullable=True)
    email = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    category = Column(String(100), nullable=True, default="General")
    payment_terms_days = Column(Integer, nullable=False, default=30)
    status = Column(String(50), nullable=False, default="ACTIVE", index=True)  # ACTIVE, INACTIVE, BLOCKED
    contract_document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    metadata_json = Column("metadata", JSON().with_variant(JSONB, "postgresql"), default=dict)

    # Relationships
    organization = relationship("Organization")
    invoices = relationship("Invoice", back_populates="vendor", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="vendor", cascade="all, delete-orphan")


class Invoice(Base):
    __tablename__ = "invoices"
    __table_args__ = (
        UniqueConstraint("organization_id", "invoice_number", name="uq_invoice_org_num"),
        {"extend_existing": True},
    )

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    vendor_id = Column(UUID(as_uuid=False), ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True, index=True)
    vendor_name = Column(String(250), nullable=False, index=True)
    invoice_number = Column(String(100), nullable=False, index=True)
    invoice_date = Column(Date, nullable=False, default=date.today)
    due_date = Column(Date, nullable=False)
    
    currency = Column(String(10), nullable=False, default="INR")
    subtotal_amount = Column(Numeric(14, 2), nullable=False, default=0.0)
    tax_amount = Column(Numeric(14, 2), nullable=False, default=0.0)
    total_amount = Column(Numeric(14, 2), nullable=False, default=0.0)
    
    payment_status = Column(String(50), nullable=False, default="PENDING", index=True)  # PENDING, PAID, OVERDUE, CANCELLED
    approval_status = Column(String(50), nullable=False, default="PENDING", index=True)  # PENDING, APPROVED, REJECTED
    approved_by = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    line_items = Column(JSON().with_variant(JSONB, "postgresql"), default=list)
    metadata_json = Column("metadata", JSON().with_variant(JSONB, "postgresql"), default=dict)

    # Relationships
    organization = relationship("Organization")
    vendor = relationship("Vendor", back_populates="invoices")
    approver = relationship("User", foreign_keys=[approved_by])
    document = relationship("Document")
    payments = relationship("Payment", back_populates="invoice")


class Expense(Base):
    __tablename__ = "expenses"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    department_id = Column(UUID(as_uuid=False), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    
    employee_name = Column(String(150), nullable=False)
    title = Column(String(250), nullable=False)
    category = Column(String(100), nullable=False, default="General", index=True)  # Travel, Office, Software, Meals, Utilities
    amount = Column(Numeric(14, 2), nullable=False)
    currency = Column(String(10), nullable=False, default="INR")
    expense_date = Column(Date, nullable=False, default=date.today)
    
    receipt_document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), nullable=False, default="PENDING", index=True)  # PENDING, APPROVED, REJECTED, REIMBURSED
    approved_by = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    metadata_json = Column("metadata", JSON().with_variant(JSONB, "postgresql"), default=dict)

    # Relationships
    organization = relationship("Organization")
    user = relationship("User", foreign_keys=[user_id])
    department = relationship("Department")
    approver = relationship("User", foreign_keys=[approved_by])
    receipt_document = relationship("Document")


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (
        UniqueConstraint("organization_id", "department_id", "fiscal_year", "period", name="uq_budget_org_dept_period"),
        {"extend_existing": True},
    )

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(UUID(as_uuid=False), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    department_name = Column(String(150), nullable=False)
    fiscal_year = Column(String(50), nullable=False, default="2025-2026")
    period = Column(String(50), nullable=False, default="ANNUAL")  # ANNUAL, Q1, Q2, Q3, Q4, MONTHLY
    
    allocated_amount = Column(Numeric(14, 2), nullable=False, default=0.0)
    spent_amount = Column(Numeric(14, 2), nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="INR")
    alert_threshold_pct = Column(Numeric(5, 2), nullable=False, default=80.0)
    status = Column(String(50), nullable=False, default="ACTIVE", index=True)  # ACTIVE, DRAFT, CLOSED
    metadata_json = Column("metadata", JSON().with_variant(JSONB, "postgresql"), default=dict)

    # Relationships
    organization = relationship("Organization")
    department = relationship("Department")


class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    invoice_id = Column(UUID(as_uuid=False), ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True, index=True)
    vendor_id = Column(UUID(as_uuid=False), ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True, index=True)
    
    payment_type = Column(String(50), nullable=False, default="PAYABLE", index=True)  # PAYABLE, RECEIVABLE
    customer_or_vendor_name = Column(String(250), nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    currency = Column(String(10), nullable=False, default="INR")
    payment_date = Column(Date, nullable=False, default=date.today)
    payment_method = Column(String(50), nullable=False, default="WIRE")  # WIRE, ACH, CARD, CHEQUE, UPI
    reference_number = Column(String(100), nullable=True)
    status = Column(String(50), nullable=False, default="COMPLETED", index=True)  # COMPLETED, PENDING, FAILED
    notes = Column(Text, nullable=True)

    # Relationships
    organization = relationship("Organization")
    invoice = relationship("Invoice", back_populates="payments")
    vendor = relationship("Vendor", back_populates="payments")


class FinancialReport(Base):
    __tablename__ = "financial_reports"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type = Column(String(50), nullable=False, index=True)  # PROFIT_LOSS, BALANCE_SHEET, CASH_FLOW, REVENUE
    title = Column(String(250), nullable=False)
    period_label = Column(String(100), nullable=False)  # Q1 2026, FY 2025-26
    fiscal_year = Column(String(50), nullable=False, default="2025-2026")
    summary_json = Column("summary", JSON().with_variant(JSONB, "postgresql"), default=dict)
    document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization")
    document = relationship("Document")
