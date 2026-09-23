import json
import os
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.services.audit_service import audit_service

router = APIRouter(prefix="/settings", tags=["Platform Settings"])

SETTINGS_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "platform_settings.json")

# Default safe configuration
DEFAULT_SETTINGS: Dict[str, Any] = {
    "platform": {
        "platform_name": "NexusRAG Multi-Domain Enterprise",
        "support_email": "support@localfix.app",
        "default_storage_quota_gb": 10,
        "reserved_subdomains": "admin, superadmin, api, app, auth, nexus, system, billing",
        "allow_tenant_registration": True,
        "brand_color": "#6366f1",
    },
    "auth": {
        "jwt_access_token_expire_minutes": 1440,
        "session_idle_timeout_hours": 72,
        "enforce_mfa_global": False,
        "max_login_attempts_lockout": 5,
        "allow_sso_google": True,
        "allow_sso_github": True,
        "allow_sso_saml": False,
    },
    "ai": {
        "default_chat_model": "gemini-1.5-pro",
        "default_embedding_model": "text-embedding-3-small",
        "default_temperature": 0.2,
        "max_context_tokens": 8192,
        "enable_streaming": True,
    },
    "rag": {
        "default_chunk_size": 512,
        "default_chunk_overlap": 64,
        "similarity_threshold": 0.75,
        "enable_hybrid_search": True,
        "vector_metric": "cosine",
    },
    "storage": {
        "max_upload_size_mb": 50,
        "allowed_mime_types": ".pdf, .docx, .txt, .csv, .json, .md",
        "auto_deduplication": True,
        "retention_days": 365,
    },
    "security": {
        "rate_limit_requests_per_min": 120,
        "allowed_cors_origins": "http://localhost:3000, http://127.0.0.1:3000",
        "ip_whitelist_superadmin": "",
    },
    "notifications": {
        "webhook_url": "https://api.localfix.app/v1/webhooks/alerts",
        "alert_on_tenant_creation": True,
        "alert_on_failed_logins": True,
        "alert_on_high_storage": True,
    },
}


def load_settings() -> Dict[str, Any]:
    try:
        if os.path.exists(SETTINGS_FILE_PATH):
            with open(SETTINGS_FILE_PATH, "r", encoding="utf-8") as f:
                saved = json.load(f)
                merged = {**DEFAULT_SETTINGS}
                for k, v in saved.items():
                    if isinstance(v, dict) and k in merged:
                        merged[k] = {**merged[k], **v}
                    else:
                        merged[k] = v
                return merged
    except Exception:
        pass
    return DEFAULT_SETTINGS.copy()


def save_settings(data: Dict[str, Any]) -> None:
    try:
        with open(SETTINGS_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist platform settings: {e}",
        )


class PlatformSettingsUpdate(BaseModel):
    platform: Optional[Dict[str, Any]] = None
    auth: Optional[Dict[str, Any]] = None
    ai: Optional[Dict[str, Any]] = None
    rag: Optional[Dict[str, Any]] = None
    storage: Optional[Dict[str, Any]] = None
    security: Optional[Dict[str, Any]] = None
    notifications: Optional[Dict[str, Any]] = None


@router.get("")
async def get_settings(
    current_user: User = Depends(get_current_user),
):
    """Retrieve platform governance and configuration parameters."""
    return load_settings()


@router.put("")
async def update_settings(
    payload: PlatformSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update root platform governance settings (SuperAdmin only)."""
    if current_user.organization_id is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Platform SuperAdmins can modify root platform settings",
        )

    current = load_settings()
    payload_dict = payload.model_dump(exclude_unset=True)

    for section, values in payload_dict.items():
        if values and section in current:
            current[section].update(values)
        elif values:
            current[section] = values

    save_settings(current)

    await audit_service.log_event(
        db=db,
        action="PLATFORM_SETTINGS_UPDATED",
        organization_id="platform",
        actor_id=str(current_user.id),
        resource_type="settings",
        resource_id="root_platform_settings",
        metadata={"sections_updated": list(payload_dict.keys())},
    )

    return {
        "message": "Platform settings updated successfully",
        "settings": current,
    }


# ===========================================================================
# SMTP & Mailing System Endpoints
# ===========================================================================

class SMTPConfigPayload(BaseModel):
    host: str = Field(..., min_length=2, description="SMTP server hostname e.g. smtp.gmail.com")
    port: int = Field(587, ge=1, le=65535, description="Port (587 for TLS, 465 for SSL, 25 for local)")
    username: Optional[str] = Field("", description="SMTP authentication username")
    password: Optional[str] = Field(None, description="SMTP password or app password")
    use_tls: bool = Field(True, description="Enable STARTTLS encryption")
    use_ssl: bool = Field(False, description="Enable SSL direct encryption")
    from_email: str = Field("noreply@nexusrag.app", description="Sender email address")
    from_name: str = Field("Nexus Enterprise", description="Sender display name")
    is_enabled: bool = Field(True, description="Whether custom SMTP is active")


class SMTPTestPayload(BaseModel):
    recipient_email: str = Field(..., description="Target email address to receive test message")
    host: Optional[str] = None
    port: Optional[int] = 587
    username: Optional[str] = None
    password: Optional[str] = None
    use_tls: Optional[bool] = True
    use_ssl: Optional[bool] = False
    from_email: Optional[str] = None
    from_name: Optional[str] = None


@router.get("/smtp")
async def get_smtp_config(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve current tenant or platform SMTP configuration (with password masked)."""
    from sqlalchemy import select
    from app.models.organization_models import OrganizationSettings

    org_id = current_user.organization_id
    smtp_data: Dict[str, Any] = {}

    if org_id:
        stmt = select(OrganizationSettings).where(OrganizationSettings.organization_id == org_id)
        res = await db.execute(stmt)
        settings_obj = res.scalar_one_or_none()
        if settings_obj and settings_obj.smtp_config:
            smtp_data = dict(settings_obj.smtp_config)
    else:
        # Platform Superadmin default
        plat = load_settings()
        smtp_data = plat.get("smtp", {})

    has_password = bool(smtp_data.get("password"))
    masked_data = {
        "host": smtp_data.get("host", ""),
        "port": int(smtp_data.get("port", 587)),
        "username": smtp_data.get("username", ""),
        "password": "••••••••" if has_password else "",
        "has_password": has_password,
        "use_tls": smtp_data.get("use_tls", True),
        "use_ssl": smtp_data.get("use_ssl", False),
        "from_email": smtp_data.get("from_email", "noreply@nexusrag.app"),
        "from_name": smtp_data.get("from_name", "Nexus Enterprise"),
        "is_enabled": smtp_data.get("is_enabled", False),
        "configured": bool(smtp_data.get("host")),
    }
    return masked_data


@router.put("/smtp")
async def save_smtp_config(
    payload: SMTPConfigPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save SMTP server settings for current tenant organization or platform."""
    from sqlalchemy import select
    from app.models.organization_models import OrganizationSettings, Organization
    from app.services.email_service import email_service

    org_id = current_user.organization_id

    # Verify if user has tenant admin or platform admin privileges
    if org_id and not current_user.is_org_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Organization Admins can configure SMTP")

    if org_id:
        stmt = select(OrganizationSettings).where(OrganizationSettings.organization_id == org_id)
        res = await db.execute(stmt)
        settings_obj = res.scalar_one_or_none()
        if not settings_obj:
            settings_obj = OrganizationSettings(organization_id=org_id)
            db.add(settings_obj)

        existing_cfg = settings_obj.smtp_config or {}
        # Keep existing password if frontend sends masked string or None
        final_password = payload.password
        if not final_password or final_password == "••••••••":
            final_password = existing_cfg.get("password", "")

        new_config = {
            "host": payload.host.strip(),
            "port": payload.port,
            "username": payload.username.strip() if payload.username else "",
            "password": final_password,
            "use_tls": payload.use_tls,
            "use_ssl": payload.use_ssl,
            "from_email": payload.from_email.strip(),
            "from_name": payload.from_name.strip(),
            "is_enabled": payload.is_enabled,
            "updated_at": str(current_user.id),
        }
        settings_obj.smtp_config = new_config
        await db.commit()
    else:
        # Platform Superadmin
        plat = load_settings()
        existing_cfg = plat.get("smtp", {})
        final_password = payload.password
        if not final_password or final_password == "••••••••":
            final_password = existing_cfg.get("password", "")

        plat["smtp"] = {
            "host": payload.host.strip(),
            "port": payload.port,
            "username": payload.username.strip() if payload.username else "",
            "password": final_password,
            "use_tls": payload.use_tls,
            "use_ssl": payload.use_ssl,
            "from_email": payload.from_email.strip(),
            "from_name": payload.from_name.strip(),
            "is_enabled": payload.is_enabled,
        }
        save_settings(plat)

    await audit_service.log_event(
        db=db,
        action="SMTP_CONFIG_SAVED",
        organization_id=str(org_id) if org_id else "platform",
        actor_id=str(current_user.id),
        resource_type="smtp_settings",
        metadata={"host": payload.host, "port": payload.port, "from_email": payload.from_email},
    )

    return {
        "status": "SUCCESS",
        "message": "SMTP configuration saved successfully",
        "configured": True,
    }


@router.post("/smtp/test")
async def test_smtp_configuration(
    payload: SMTPTestPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Test SMTP handshake and dispatch a verification email."""
    from sqlalchemy import select
    from app.models.organization_models import OrganizationSettings, Organization
    from app.services.email_service import email_service

    org_id = current_user.organization_id
    org_name = "Nexus Enterprise"
    existing_cfg = {}

    if org_id:
        stmt = select(OrganizationSettings).where(OrganizationSettings.organization_id == org_id)
        res = await db.execute(stmt)
        settings_obj = res.scalar_one_or_none()
        if settings_obj and settings_obj.smtp_config:
            existing_cfg = settings_obj.smtp_config
        org_obj = await db.get(Organization, org_id)
        if org_obj:
            org_name = org_obj.name

    # Merge explicit test params with existing config
    host = payload.host or existing_cfg.get("host")
    port = payload.port or existing_cfg.get("port", 587)
    username = payload.username if payload.username is not None else existing_cfg.get("username", "")
    password = payload.password
    if not password or password == "••••••••":
        password = existing_cfg.get("password", "")

    from_email = payload.from_email or existing_cfg.get("from_email", "noreply@nexusrag.app")
    from_name = payload.from_name or existing_cfg.get("from_name", org_name)
    use_tls = payload.use_tls if payload.use_tls is not None else existing_cfg.get("use_tls", True)
    use_ssl = payload.use_ssl if payload.use_ssl is not None else existing_cfg.get("use_ssl", False)

    if not host:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SMTP host is required to execute test.",
        )

    test_config = {
        "host": host,
        "port": port,
        "username": username,
        "password": password,
        "use_tls": use_tls,
        "use_ssl": use_ssl,
        "from_email": from_email,
        "from_name": from_name,
    }

    # 1. Test SMTP Connection Handshake
    ok, err_msg = await email_service.verify_smtp_connection(test_config)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"SMTP Handshake Failed: {err_msg}",
        )

    # 2. Dispatch Test Email
    sent_ok, send_msg = await email_service.send_test_email(
        config=test_config,
        to_email=payload.recipient_email.strip(),
        organization_name=org_name,
    )

    if not sent_ok:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Handshake succeeded but email delivery failed: {send_msg}",
        )

    return {
        "status": "SUCCESS",
        "message": f"Test email delivered successfully to {payload.recipient_email}",
        "details": {
            "host": host,
            "port": port,
            "recipient": payload.recipient_email,
        },
    }

