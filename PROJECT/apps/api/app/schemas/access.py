from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field


class DepartmentItem(BaseModel):
    id: str
    name: str
    slug: str
    is_primary: bool = False


class RoleItem(BaseModel):
    id: Optional[str] = None
    name: str
    slug: str
    is_system: bool = True


class DomainItem(BaseModel):
    id: Optional[str] = None
    name: str
    slug: str
    icon: Optional[str] = None


class ModuleItem(BaseModel):
    id: Optional[str] = None
    name: str
    slug: str
    domain: Optional[str] = None
    icon: Optional[str] = None
    route: Optional[str] = None
    enabled: bool = True
    required_permission: Optional[str] = None


class OrganizationSummary(BaseModel):
    id: Optional[str] = None
    name: str
    slug: str
    subdomain: Optional[str] = None
    status: str = "ACTIVE"


class UserProfileSummary(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    name: Optional[str] = None
    is_active: bool = True
    status: str = "ACTIVE"
    is_org_admin: bool = False
    is_superadmin: bool = False


class UserAccessResponse(BaseModel):
    user: UserProfileSummary
    organization: Optional[OrganizationSummary] = None
    roles: List[RoleItem] = Field(default_factory=list)
    departments: List[DepartmentItem] = Field(default_factory=list)
    domains: List[DomainItem] = Field(default_factory=list)
    modules: List[ModuleItem] = Field(default_factory=list)
    permissions: List[str] = Field(default_factory=list)


class UserListItem(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    name: Optional[str] = None
    is_active: bool
    status: str  # INVITED, PENDING_APPROVAL, ACTIVE, SUSPENDED
    is_org_admin: bool
    is_superadmin: bool = False
    organization_id: Optional[str] = None
    tenant: Optional[str] = None
    departments: List[DepartmentItem] = Field(default_factory=list)
    roles: List[RoleItem] = Field(default_factory=list)
    primary_department: Optional[DepartmentItem] = None
    primary_role: Optional[RoleItem] = None
    permission_keys: List[str] = Field(default_factory=list)
    created_at: Optional[str] = None

    # Backward compatibility helper fields
    department_name: Optional[str] = None
    department_slug: Optional[str] = None
    department_id: Optional[str] = None
    role: Optional[str] = None
    role_name: Optional[str] = None
    role_slug: Optional[str] = None
    role_id: Optional[str] = None


class PaginatedUsersResponse(BaseModel):
    items: List[UserListItem]
    page: int
    page_size: int
    total: int
    pages: int


class UserStatusUpdate(BaseModel):
    status: Optional[str] = None  # ACTIVE, PENDING_APPROVAL, SUSPENDED
    is_active: Optional[bool] = None


class UserDepartmentAssign(BaseModel):
    department_id: str
    is_primary: Optional[bool] = True


class UserRoleAssign(BaseModel):
    role_id: Optional[str] = None
    role_slug: Optional[str] = None


class UserPermissionOverride(BaseModel):
    permission_id: Optional[str] = None
    permission_key: Optional[str] = None
    effect: str = Field(..., pattern="^(ALLOW|DENY)$")
