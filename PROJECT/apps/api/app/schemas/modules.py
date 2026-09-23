from typing import Optional, List
from pydantic import BaseModel


class ModuleResponse(BaseModel):
    id: str
    name: str
    slug: str
    icon: Optional[str] = "box"
    route: Optional[str] = None
    required_permission: Optional[str] = "*"
    permissions: List[str] = []
