from typing import Optional
from pydantic import BaseModel


class PermissionResponse(BaseModel):
    id: str
    resource: str
    action: str
    permission_key: str
    description: Optional[str] = None
