from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RoleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: Optional[str] = None
    domain_id: Optional[str] = None
    organization_id: Optional[str] = None
    scope: Optional[str] = "tenant"
    description: Optional[str] = None
    permission_keys: List[str] = Field(default_factory=list)


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permission_keys: Optional[List[str]] = None
