import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from jose import JWTError, jwt
from app.config import settings


def create_access_token(
    subject: str,
    organization_id: Optional[str] = None,
    session_id: Optional[str] = None,
    claims: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create short-lived signed JWT access token containing minimal claims."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire_minutes = getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 60)
        expire = now + timedelta(minutes=expire_minutes)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "organization_id": str(organization_id) if organization_id else None,
        "session_id": str(session_id) if session_id else None,
        "token_type": "access",
        "jti": secrets.token_hex(16),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    if claims:
        to_encode.update(claims)

    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_platform_admin_token(
    admin_id: Optional[str] = None,
    email: Optional[str] = None,
    subject: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    sub_val = admin_id or subject or ""
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(hours=12))
    to_encode: Dict[str, Any] = {
        "sub": str(sub_val),
        "email": email or "",
        "is_platform_admin": True,
        "is_superadmin": True,
        "token_type": "platform_admin_access",
        "jti": secrets.token_hex(16),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_activation_token(
    organization_id: str,
    user_id: str,
    organization_slug: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(hours=48))
    to_encode: Dict[str, Any] = {
        "sub": str(user_id),
        "organization_id": str(organization_id),
        "organization_slug": str(organization_slug),
        "token_type": "tenant_activation",
        "jti": secrets.token_hex(16),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid or expired token: {str(e)}") from e
