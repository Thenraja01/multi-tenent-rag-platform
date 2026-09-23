from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    organization_id: Optional[str] = None
    subdomain: Optional[str] = None
    organization_slug: Optional[str] = None


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str
    organization_slug: Optional[str] = None


class RegisterRequest(BaseModel):
    organization_name: str
    email: str = Field(..., min_length=3)
    full_name: str
    password: str
    subdomain: Optional[str] = None
