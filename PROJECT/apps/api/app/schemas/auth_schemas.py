from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field
from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    organization_name: str = Field(..., min_length=2, max_length=200)
    organization_slug: str = Field(..., min_length=2, max_length=100)
    email: str
    full_name: str = Field(..., min_length=2, max_length=200)
    password: str = Field(..., min_length=8)
    plan_slug: Optional[str] = "starter"


RegisterOrganizationRequest = RegisterRequest


class UserCreate(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    full_name: str
    role_id: Optional[str] = None
    department_id: Optional[str] = None
    domain_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str
    organization_slug: Optional[str] = None


class PasswordResetRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str


class PlatformAdminLoginRequest(BaseModel):
    email: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int = 3600
    organization_id: Optional[str] = None
    organization_slug: Optional[str] = None
    is_superadmin: Optional[bool] = False
    status: Optional[str] = None
    message: Optional[str] = None
    user: Optional[Dict[str, Any]] = None



class UserProfileResponse(BaseModel):
    id: str
    organization_id: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime


class ModuleContextItem(BaseModel):
    id: str
    name: str
    slug: str
    module_type: str
    features: List[str] = Field(default_factory=list)


class DomainContextItem(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    modules: List[ModuleContextItem] = Field(default_factory=list)


class OrganizationContextItem(BaseModel):
    id: str
    name: str
    slug: str
    status: str


class UserContextResponse(BaseModel):
    organization: OrganizationContextItem
    user: UserProfileResponse
    permissions: List[str] = Field(default_factory=list)
    domains: List[DomainContextItem] = Field(default_factory=list)
