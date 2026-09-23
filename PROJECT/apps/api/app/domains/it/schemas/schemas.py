from typing import Optional
from pydantic import BaseModel, Field


class ITTicketCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=250)
    description: Optional[str] = None
    priority: str = Field(default="MEDIUM", pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    category: Optional[str] = "General"


class ITTicketResponse(BaseModel):
    id: str
    title: str
    priority: str
    status: str

    class Config:
        from_attributes = True
