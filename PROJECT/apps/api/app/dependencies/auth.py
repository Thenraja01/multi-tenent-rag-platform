import logging
import uuid
from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, set_rls_context
from app.core.security import decode_token
from app.models.identity_models import User, Session
from app.models.platform_models import PlatformAdmin

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


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Validate JWT access token, check session active status, and return User model."""
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

    # Verify session is not revoked if session_id is present
    if session_id and is_valid_uuid(session_id):
        sess = await db.get(Session, session_id)
        if not sess or sess.revoked_at is not None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session has been revoked or expired")

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
    if not current_user.is_org_admin:
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


