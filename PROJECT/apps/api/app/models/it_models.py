import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base


class ITTicket(Base):
    __tablename__ = "it_tickets"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    ticket_number = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False, default="MEDIUM")
    category = Column(String(50), nullable=False, default="SYSTEM")
    status = Column(String(30), nullable=False, default="OPEN", index=True)
    created_by_user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_by_name = Column(String(200), nullable=True)
    assigned_to = Column(String(200), nullable=True, default="Unassigned")
    resolution_notes = Column(Text, nullable=True)
    ai_generated = Column(Boolean, nullable=False, default=False)

    organization = relationship("Organization")
    created_by = relationship("User")


class ITRunbook(Base):
    __tablename__ = "it_runbooks"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, default="INFRASTRUCTURE")
    steps = Column(JSON().with_variant(JSONB, "postgresql"), default=list)
    tags = Column(JSON().with_variant(JSONB, "postgresql"), default=list)
    content = Column(Text, nullable=False)

    organization = relationship("Organization")
