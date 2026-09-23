import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Integer,
    DateTime,
    ForeignKey,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base


class Organization(Base):
    __tablename__ = "organizations"
    __table_args__ = {"extend_existing": True}

    plan_id = Column(UUID(as_uuid=False), ForeignKey("plans.id", ondelete="RESTRICT"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    status = Column(String(30), nullable=False, default="ACTIVE", index=True)  # ACTIVE, SUSPENDED, PENDING, ARCHIVED
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    plan = relationship("Plan", back_populates="organizations")
    organization_settings = relationship("OrganizationSettings", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    custom_domains = relationship("OrganizationCustomDomain", back_populates="organization", cascade="all, delete-orphan")
    organization_packs = relationship("OrganizationPack", back_populates="organization", cascade="all, delete-orphan")
    domains = relationship("Domain", back_populates="organization", cascade="all, delete-orphan")
    departments = relationship("Department", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="organization", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="organization", cascade="all, delete-orphan")
    rag_queries = relationship("RAGQuery", back_populates="organization", cascade="all, delete-orphan")
    employees = relationship("Employee", back_populates="organization", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="organization", cascade="all, delete-orphan")


class OrganizationSettings(Base):
    __tablename__ = "organization_settings"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    mfa_required = Column(Boolean, nullable=False, default=False)
    password_login_enabled = Column(Boolean, nullable=False, default=True)
    session_timeout_minutes = Column(Integer, nullable=False, default=60)
    allowed_email_domains = Column(JSON().with_variant(JSONB, "postgresql"), default=list)
    security_config = Column(JSON().with_variant(JSONB, "postgresql"), default=dict)
    branding_config = Column(JSON().with_variant(JSONB, "postgresql"), default=dict)
    smtp_config = Column(JSON().with_variant(JSONB, "postgresql"), default=dict)

    organization = relationship("Organization", back_populates="organization_settings")


class OrganizationCustomDomain(Base):
    __tablename__ = "organization_custom_domains"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    hostname = Column(String(255), nullable=False, unique=True, index=True)
    verification_status = Column(String(30), nullable=False, default="PENDING", index=True)  # PENDING, VERIFIED, FAILED
    verification_token = Column(Text, nullable=True)
    is_primary = Column(Boolean, nullable=False, default=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="custom_domains")


class OrganizationPack(Base):
    __tablename__ = "organization_packs"
    __table_args__ = (
        UniqueConstraint("organization_id", "pack_id", name="uq_org_pack"),
        {"extend_existing": True},
    )

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    pack_id = Column(UUID(as_uuid=False), ForeignKey("packs.id", ondelete="CASCADE"), nullable=False, index=True)
    is_active = Column(Boolean, nullable=False, default=True)
    assigned_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="organization_packs")
    pack = relationship("Pack", back_populates="organization_packs")
