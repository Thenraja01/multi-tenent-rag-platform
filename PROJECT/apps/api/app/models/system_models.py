import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON().with_variant(JSONB, "postgresql"), default=dict)
    read_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="notifications")
    recipient = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    actor_id = Column(UUID(as_uuid=False), nullable=True, index=True)
    action = Column(String(150), nullable=False, index=True)
    resource_type = Column(String(100), nullable=True, index=True)
    resource_id = Column(UUID(as_uuid=False), nullable=True, index=True)
    metadata_json = Column("metadata", JSON().with_variant(JSONB, "postgresql"), default=dict)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(Text, nullable=True)
