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
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("organization_id", "email", name="uq_user_org_email"),
        {"extend_existing": True},
    )

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(320), nullable=False, index=True)
    full_name = Column(String(200), nullable=False)
    password_hash = Column(Text, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    status = Column(String(50), nullable=False, default="ACTIVE", index=True)  # INVITED, PENDING_APPROVAL, ACTIVE, SUSPENDED
    is_org_admin = Column(Boolean, nullable=False, default=False)
    email_verified = Column(Boolean, nullable=False, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    user_departments = relationship("UserDepartment", back_populates="user", cascade="all, delete-orphan")
    user_roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    uploaded_documents = relationship("Document", back_populates="uploader", foreign_keys="Document.uploaded_by")
    document_accesses = relationship("DocumentUser", back_populates="user", cascade="all, delete-orphan")
    rag_queries = relationship("RAGQuery", back_populates="user", cascade="all, delete-orphan")
    employee = relationship("Employee", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="recipient", cascade="all, delete-orphan")
    user_permissions = relationship("UserPermission", back_populates="user", foreign_keys="UserPermission.user_id", cascade="all, delete-orphan")


class Department(Base):
    __tablename__ = "departments"
    __table_args__ = (
        UniqueConstraint("organization_id", "slug", name="uq_department_org_slug"),
        {"extend_existing": True},
    )

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="ACTIVE", index=True)

    # Relationships
    organization = relationship("Organization", back_populates="departments")
    user_departments = relationship("UserDepartment", back_populates="department", cascade="all, delete-orphan")
    document_accesses = relationship("DocumentDepartment", back_populates="department", cascade="all, delete-orphan")
    employees = relationship("Employee", back_populates="department")


class UserDepartment(Base):
    __tablename__ = "user_departments"
    __table_args__ = (
        UniqueConstraint("user_id", "department_id", name="uq_user_dept"),
        {"extend_existing": True},
    )

    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(UUID(as_uuid=False), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    is_primary = Column(Boolean, nullable=False, default=False)
    assigned_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="user_departments")
    department = relationship("Department", back_populates="user_departments")


class Domain(Base):
    __tablename__ = "domains"
    __table_args__ = (
        UniqueConstraint("organization_id", "slug", name="uq_domain_org_slug"),
        {"extend_existing": True},
    )

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="ACTIVE", index=True)

    # Relationships
    organization = relationship("Organization", back_populates="domains")
    domain_modules = relationship("DomainModule", back_populates="domain", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="domain", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="domain", cascade="all, delete-orphan")
    rag_queries = relationship("RAGQuery", back_populates="domain", cascade="all, delete-orphan")


class DomainModule(Base):
    __tablename__ = "domain_modules"
    __table_args__ = (
        UniqueConstraint("domain_id", "module_id", name="uq_domain_module"),
        {"extend_existing": True},
    )

    domain_id = Column(UUID(as_uuid=False), ForeignKey("domains.id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(UUID(as_uuid=False), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False, index=True)
    enabled = Column(Boolean, nullable=False, default=True)
    sort_order = Column(Integer, nullable=False, default=0)

    domain = relationship("Domain", back_populates="domain_modules")
    module = relationship("Module", back_populates="domain_modules")


class Role(Base):
    __tablename__ = "roles"
    __table_args__ = (
        UniqueConstraint("organization_id", "domain_id", "slug", name="uq_role_org_domain_slug"),
        {"extend_existing": True},
    )

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    domain_id = Column(UUID(as_uuid=False), ForeignKey("domains.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_system = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    organization = relationship("Organization", back_populates="roles")
    domain = relationship("Domain", back_populates="roles")
    role_permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")
    user_roles = relationship("UserRole", back_populates="role", cascade="all, delete-orphan")
    document_accesses = relationship("DocumentRole", back_populates="role", cascade="all, delete-orphan")


class RolePermission(Base):
    __tablename__ = "role_permissions"
    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
        {"extend_existing": True},
    )

    role_id = Column(UUID(as_uuid=False), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True)
    permission_id = Column(UUID(as_uuid=False), ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False, index=True)

    role = relationship("Role", back_populates="role_permissions")
    permission = relationship("Permission", back_populates="role_permissions")


class UserRole(Base):
    __tablename__ = "user_roles"
    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="uq_user_role"),
        {"extend_existing": True},
    )

    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(UUID(as_uuid=False), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")


class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = {"extend_existing": True}

    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    refresh_token_hash = Column(Text, nullable=False, index=True)
    device_id = Column(String(255), nullable=True)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="sessions")


class UserPermission(Base):
    __tablename__ = "user_permissions"
    __table_args__ = (
        UniqueConstraint("user_id", "permission_id", name="uq_user_permission"),
        {"extend_existing": True},
    )

    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    permission_id = Column(UUID(as_uuid=False), ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False, index=True)
    effect = Column(String(10), nullable=False, default="ALLOW")  # ALLOW or DENY
    created_by = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="user_permissions", foreign_keys=[user_id])
    permission = relationship("Permission")
