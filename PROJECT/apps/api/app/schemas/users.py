from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: Optional[str] = "Test123!"
    organization_id: Optional[str] = None
    department_id: Optional[str] = None
    role_id: Optional[str] = None
    is_org_admin: Optional[bool] = False
    is_superadmin: Optional[bool] = False


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    is_org_admin: Optional[bool] = None
    department_id: Optional[str] = None
    role_id: Optional[str] = None


class UserPermissionOverride(BaseModel):
    permission_id: Optional[str] = None
    permission_code: Optional[str] = None
    effect: str = Field(..., pattern="^(ALLOW|DENY)$")
