import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    BigInteger,
    Integer,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class PlatformAdmin(Base):
    __tablename__ = "platform_admins"
    __table_args__ = {"extend_existing": True}

    email = Column(String(320), nullable=False, unique=True, index=True)
    full_name = Column(String(200), nullable=False)
    password_hash = Column(Text, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    mfa_enabled = Column(Boolean, nullable=False, default=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)


class Plan(Base):
    __tablename__ = "plans"
    __table_args__ = {"extend_existing": True}

    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    max_users = Column(Integer, nullable=True)
    max_storage_bytes = Column(BigInteger, nullable=True)
    max_documents = Column(BigInteger, nullable=True)
    max_ai_tokens = Column(BigInteger, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    organizations = relationship("Organization", back_populates="plan")


class Pack(Base):
    __tablename__ = "packs"
    __table_args__ = {"extend_existing": True}

    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    pack_modules = relationship("PackModule", back_populates="pack", cascade="all, delete-orphan")
    organization_packs = relationship("OrganizationPack", back_populates="pack", cascade="all, delete-orphan")


class Module(Base):
    __tablename__ = "modules"
    __table_args__ = {"extend_existing": True}

    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    module_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    pack_modules = relationship("PackModule", back_populates="module", cascade="all, delete-orphan")
    module_features = relationship("ModuleFeature", back_populates="module", cascade="all, delete-orphan")
    domain_modules = relationship("DomainModule", back_populates="module", cascade="all, delete-orphan")


class PackModule(Base):
    __tablename__ = "pack_modules"
    __table_args__ = (
        UniqueConstraint("pack_id", "module_id", name="uq_pack_module"),
        {"extend_existing": True},
    )

    pack_id = Column(UUID(as_uuid=False), ForeignKey("packs.id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(UUID(as_uuid=False), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False, index=True)
    sort_order = Column(Integer, nullable=False, default=0)
    is_required = Column(Boolean, nullable=False, default=False)

    pack = relationship("Pack", back_populates="pack_modules")
    module = relationship("Module", back_populates="pack_modules")


class Feature(Base):
    __tablename__ = "features"
    __table_args__ = {"extend_existing": True}

    name = Column(String(150), nullable=False)
    slug = Column(String(150), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    module_features = relationship("ModuleFeature", back_populates="feature", cascade="all, delete-orphan")


class ModuleFeature(Base):
    __tablename__ = "module_features"
    __table_args__ = (
        UniqueConstraint("module_id", "feature_id", name="uq_module_feature"),
        {"extend_existing": True},
    )

    module_id = Column(UUID(as_uuid=False), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False, index=True)
    feature_id = Column(UUID(as_uuid=False), ForeignKey("features.id", ondelete="CASCADE"), nullable=False, index=True)
    sort_order = Column(Integer, nullable=False, default=0)
    is_default = Column(Boolean, nullable=False, default=True)

    module = relationship("Module", back_populates="module_features")
    feature = relationship("Feature", back_populates="module_features")


class Permission(Base):
    __tablename__ = "permissions"
    __table_args__ = {"extend_existing": True}

    resource = Column(String(100), nullable=False, index=True)
    action = Column(String(100), nullable=False, index=True)
    permission_key = Column(String(200), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)

    # Relationships
    role_permissions = relationship("RolePermission", back_populates="permission", cascade="all, delete-orphan")
