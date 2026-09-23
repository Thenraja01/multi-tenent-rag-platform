"""
Dashboard Configuration Models & Schemas.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class DashboardCardConfig(BaseModel):
    id: str
    title: str
    module: str
    required_permission: str
    size: str = "medium"  # small, medium, large
    position: int = 1
    data_scope: str = "SELF"


class DashboardPayload(BaseModel):
    cards: List[DashboardCardConfig]
    metrics: Dict[str, Any] = Field(default_factory=dict)
    data_scopes: Dict[str, str] = Field(default_factory=dict)
    permissions: List[str] = Field(default_factory=list)
