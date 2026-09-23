from datetime import date
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


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


class InvoiceResponse(BaseModel):
    id: str
    vendor_name: str
    invoice_number: str
    total_amount: Decimal
    currency: str
    payment_status: str
    approval_status: str

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    employee_name: str = Field(..., min_length=2)
    department_id: Optional[str] = None
    title: str = Field(..., min_length=2, max_length=250)
    category: str = Field(default="General")
    amount: Decimal = Field(..., gt=0)
    receipt_document_id: Optional[str] = None
    notes: Optional[str] = None
