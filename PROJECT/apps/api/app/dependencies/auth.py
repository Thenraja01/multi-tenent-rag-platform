import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Set
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, set_rls_context
from app.core.security import decode_token
from app.models.identity_models import User, Session
from app.models.organization_models import Organization
from app.models.platform_models import PlatformAdmin
from app.services.access_service import AccessService

logger = logging.getLogger("nexusrag.deps.auth")
security_bearer = HTTPBearer(auto_error=False)


def is_valid_uuid(val: Optional[str]) -> bool:
    if not val:
        return False
    try:
        uuid.UUID(str(val).strip())
        return True
    except (ValueError, AttributeError, TypeError):
        return False


def extract_host_tenant_slug(request: Request) -> Optional[str]:
    """
    Extract tenant subdomain authoritatively from trusted HTTP Host header.
    Examples:
      - 'globex.localfix.app:3000' -> 'globex'
      - 'acme.nexusrag.com' -> 'acme'
      - 'localhost:3000' -> None (Platform root)
    """
    host_header = request.headers.get("host", "").split(":")[0].strip().lower()
    if not host_header:
        return None

    base_domains = ["localhost", "127.0.0.1", "localfix.app", "nexusrag.com", "nexusrag.local", "nip.io"]
    for base in base_domains:
        if host_header.endswith(f".{base}"):
            sub = host_header[: -(len(base) + 1)]
            parts = [p for p in sub.split(".") if p]
            # Ignore reserved system subdomains
            reserved = {"platform", "admin", "superadmin", "api", "www", "app", "login", "register", "auth"}
            if len(parts) == 1 and parts[0] not in reserved:
                return parts[0]
            elif len(parts) >= 2 and parts[1] not in reserved:
                return parts[1]
    return None


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Validate JWT access token, check session active status, verify server-side host tenant boundary,
    and return User model.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = decode_token(token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    session_id = payload.get("session_id")
    token_version = payload.get("token_version")
    is_platform_admin = payload.get("is_platform_admin", False)

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    user = None
    if is_valid_uuid(user_id):
        user = await db.get(User, user_id)

    if not user or not user.is_active or user.deleted_at is not None:
        # Check if user is a PlatformAdmin
        admin = None
        if is_valid_uuid(user_id):
            admin = await db.get(PlatformAdmin, user_id)

        if not admin:
            token_email = payload.get("email") or (user_id if "@" in str(user_id) else None)
            if token_email:
                res = await db.execute(select(PlatformAdmin).where(PlatformAdmin.email == token_email))
                admin = res.scalar_one_or_none()

        if admin and admin.is_active:
            user = User(
                id=admin.id,
                email=admin.email,
                full_name=admin.full_name,
                is_active=admin.is_active,
                organization_id=None,
            )
            user.is_org_admin = True
            request.state.organization_id = None
            request.state.current_user = user
            return user
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive or disabled")

    # Immediate session revocation check
    if session_id and is_valid_uuid(session_id):
        sess = await db.get(Session, session_id)
        if not sess or sess.revoked_at is not None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session has been revoked")
        if sess.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session has expired")

    # Token version check if defined on user model
    user_token_version = getattr(user, "token_version", None)
    if user_token_version is not None and token_version is not None:
        if token_version < user_token_version:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session invalidated due to security update")

    # Authoritative Host-Based Tenant Boundary Check (No X-Tenant-ID header spoofing)
    requested_host_slug = extract_host_tenant_slug(request)
    if requested_host_slug and user.organization_id:
        org_obj = await db.get(Organization, user.organization_id)
        if org_obj and org_obj.slug != requested_host_slug:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="TENANT_ACCESS_DENIED: You do not have access to this organization workspace.",
            )

    # Set PostgreSQL RLS context
    effective_org_id = str(user.organization_id) if user.organization_id else None
    if effective_org_id:
        await set_rls_context(db, effective_org_id)
    request.state.organization_id = effective_org_id
    request.state.current_user = user

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure user is active."""
    if not current_user.is_active or current_user.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")
    return current_user


async def get_current_org_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure user is an organization admin."""
    if not current_user.is_org_admin and current_user.organization_id is not None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Organization administrator access required")
    return current_user


async def get_current_platform_admin(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db),
) -> PlatformAdmin:
    """Validate platform administrator token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Platform admin credentials required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin token")

    if not payload.get("is_platform_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform administrator access required")

    admin_id = payload.get("sub")
    admin = None
    if is_valid_uuid(admin_id):
        admin = await db.get(PlatformAdmin, admin_id)

    if not admin:
        token_email = payload.get("email") or (admin_id if "@" in str(admin_id) else None)
        if token_email:
            res = await db.execute(select(PlatformAdmin).where(PlatformAdmin.email == token_email))
            admin = res.scalar_one_or_none()

    if not admin or not admin.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin account is inactive")

    return admin


class RequirePermission:
    """
    Dependency Factory for Atomic Access Control:
    Evaluates Conjunction:
      Access = Tenant.isActive AND Module.isEnabled AND DeptScope.isValid AND Permission.isPresent
    """

    def __init__(
        self,
        permission_key: str,
        module_slug: Optional[str] = None,
        department_scoped: bool = True,
    ):
        self.permission_key = permission_key.lower().strip()
        self.module_slug = module_slug.lower().strip() if module_slug else None
        self.department_scoped = department_scoped

    async def __call__(
        self,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        # Platform Superadmin has full system authority
        if current_user.organization_id is None and current_user.is_org_admin:
            return current_user

        authz = await AccessService.get_user_access(db, current_user)

        # 1. Tenant Status Check
        org = authz.get("organization")
        if not org or org.get("status") != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="TENANT_INACTIVE: Your organization workspace is currently inactive or suspended.",
            )

        # 2. Module Gate Check
        if self.module_slug:
            enabled_modules = {m["slug"].lower() for m in authz.get("modules", []) if m.get("enabled")}
            if self.module_slug not in enabled_modules and not current_user.is_org_admin:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"MODULE_DISABLED: The '{self.module_slug}' module is not licensed or activated for your organization.",
                )

        # 3. Permission Gate Check
        user_perms: Set[str] = set(authz.get("permissions", []))
        has_perm = (
            self.permission_key in user_perms
            or f"{self.permission_key.split('.')[0]}.*" in user_perms
            or "*" in user_perms
            or (current_user.is_org_admin and self.permission_key.startswith("org."))
        )

        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"PERMISSION_DENIED: Missing required permission '{self.permission_key}'",
            )

        return current_user


