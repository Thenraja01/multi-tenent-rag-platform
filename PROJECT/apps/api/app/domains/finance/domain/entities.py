from dataclasses import dataclass
from decimal import Decimal
from datetime import date
from typing import Optional


@dataclass
class InvoiceEntity:
    id: str
    organization_id: str
    vendor_name: str
    invoice_number: str
    total_amount: Decimal
    due_date: date
    payment_status: str
    approval_status: str = "PENDING"


@dataclass
class ExpenseEntity:
    id: str
    organization_id: str
    employee_name: str
    title: str
    amount: Decimal
    status: str = "PENDING"
