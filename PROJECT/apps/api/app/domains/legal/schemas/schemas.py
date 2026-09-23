from typing import Optional
from datetime import date
from pydantic import BaseModel, Field


class LegalContractCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=250)
    party_name: str = Field(..., min_length=2, max_length=250)
    contract_type: str = Field(default="NDA")
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    document_id: Optional[str] = None
