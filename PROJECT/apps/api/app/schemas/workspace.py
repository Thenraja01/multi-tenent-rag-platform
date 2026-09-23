from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class WorkspaceContextResponse(BaseModel):
    organization: Dict[str, Any]
    domains: List[Dict[str, Any]]
    packs: List[Dict[str, Any]]
    modules: List[Dict[str, Any]]
    user: Dict[str, Any]
    roles: List[Any]
    permissions: List[str]
    data_scopes: Dict[str, str]
    plan: Optional[Dict[str, Any]] = None
