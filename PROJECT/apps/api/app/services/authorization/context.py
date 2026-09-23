from dataclasses import dataclass, field
from typing import List, Optional, Set, Dict, Any


@dataclass
class RequestContext:
    request_id: str
    user_id: Optional[str] = None
    email: Optional[str] = None
    tenant_id: Optional[str] = None
    tenant_slug: Optional[str] = None
    domain_id: Optional[str] = None
    domain_slug: Optional[str] = None
    department_id: Optional[str] = None
    department_slug: Optional[str] = None
    pack_id: Optional[str] = None
    pack_slug: Optional[str] = None
    is_superadmin: bool = False
    is_org_admin: bool = False
    roles: List[str] = field(default_factory=list)
    permissions: Set[str] = field(default_factory=set)
    allowed_modules: List[str] = field(default_factory=list)
    data_scopes: Dict[str, str] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def has_permission(self, permission: str) -> bool:
        """Check if context contains explicit permission or wildcard."""
        if self.is_superadmin or self.is_org_admin or "*" in self.permissions or "admin.*" in self.permissions:
            return True
        if permission in self.permissions:
            return True
        # Prefix wildcard support (e.g. 'leave:*' matches 'leave:view')
        if ":" in permission:
            prefix = permission.split(":")[0]
            if f"{prefix}:*" in self.permissions:
                return True
        return False

    def is_module_allowed(self, module_slug: str) -> bool:
        """Check if module is enabled in active pack/domain for this context."""
        if self.is_superadmin or self.is_org_admin or "*" in self.permissions or "admin.*" in self.permissions:
            return True
        return module_slug.lower() in [m.lower() for m in self.allowed_modules]
