import logging
from typing import Any, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.system_models import AuditLog

logger = logging.getLogger("nexusrag.audit")


class AuditService:
 
    @staticmethod
    async def log_event(
        db: AsyncSession,
        action: str,
        organization_id: Optional[str] = None,
        actor_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        """Create and commit an immutable audit log record."""
        audit_entry = AuditLog(
            action=action,
            organization_id=organization_id,
            actor_id=actor_id,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=metadata or {},
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(audit_entry)
        try:
            await db.commit()
            await db.refresh(audit_entry)
        except Exception as e:
            logger.error(f"Audit log write failed: {e}")
            await db.rollback()
        return audit_entry


audit_service = AuditService()
