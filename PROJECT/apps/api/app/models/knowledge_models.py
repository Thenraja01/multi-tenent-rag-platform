import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    Column,
    String,
    Text,
    BigInteger,
    Integer,
    DateTime,
    ForeignKey,
    JSON,
    Index,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.models.base import Base


class Document(Base):
    __tablename__ = "documents"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    domain_id = Column(UUID(as_uuid=False), ForeignKey("domains.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    filename = Column(String(500), nullable=False)
    storage_key = Column(Text, nullable=False, unique=True)
    mime_type = Column(String(150), nullable=False)
    file_size = Column(BigInteger, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="STORED", index=True)  # Legacy compatibility
    document_status = Column(String(50), nullable=False, default="STORED", index=True)  # DRAFT, STORED, ARCHIVED, DELETED
    knowledge_status = Column(String(50), nullable=False, default="NOT_ENABLED", index=True)  # NOT_ENABLED, QUEUED, PROCESSING, READY, FAILED, DISABLED
    knowledge_enabled_by = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    knowledge_enabled_at = Column(DateTime(timezone=True), nullable=True)
    embedding_model = Column(String(100), nullable=True, default="nomic-embed-text")
    page_count = Column(Integer, nullable=True)
    chunk_count = Column(Integer, nullable=True, default=0)
    metadata_json = Column("metadata", JSON().with_variant(JSONB, "postgresql"), default=dict)

    # Relationships
    organization = relationship("Organization", back_populates="documents")
    domain = relationship("Domain", back_populates="documents")
    uploader = relationship("User", back_populates="uploaded_documents", foreign_keys=[uploaded_by])
    knowledge_enabler = relationship("User", foreign_keys=[knowledge_enabled_by])
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    user_accesses = relationship("DocumentUser", back_populates="document", cascade="all, delete-orphan")
    department_accesses = relationship("DocumentDepartment", back_populates="document", cascade="all, delete-orphan")
    role_accesses = relationship("DocumentRole", back_populates="document", cascade="all, delete-orphan")



class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    __table_args__ = (
        UniqueConstraint("document_id", "chunk_index", name="uq_document_chunk_index"),
        Index("idx_document_chunks_embedding", "embedding", postgresql_using="hnsw", postgresql_ops={"embedding": "vector_cosine_ops"}),
        {"extend_existing": True},
    )

    document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(1536), nullable=True)
    chunk_metadata = Column(JSON().with_variant(JSONB, "postgresql"), default=dict)
    page_number = Column(Integer, nullable=True)

    document = relationship("Document", back_populates="chunks")
    query_sources = relationship("RAGQuerySource", back_populates="chunk", cascade="all, delete-orphan")


class DocumentUser(Base):
    __tablename__ = "document_users"
    __table_args__ = (
        UniqueConstraint("document_id", "user_id", name="uq_document_user"),
        {"extend_existing": True},
    )

    document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    access_level = Column(String(20), nullable=False, default="READ")  # READ, WRITE, ADMIN

    document = relationship("Document", back_populates="user_accesses")
    user = relationship("User", back_populates="document_accesses")


class DocumentDepartment(Base):
    __tablename__ = "document_departments"
    __table_args__ = (
        UniqueConstraint("document_id", "department_id", name="uq_document_dept"),
        {"extend_existing": True},
    )

    document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(UUID(as_uuid=False), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    access_level = Column(String(20), nullable=False, default="READ")  # READ, WRITE, ADMIN

    document = relationship("Document", back_populates="department_accesses")
    department = relationship("Department", back_populates="document_accesses")


class DocumentRole(Base):
    __tablename__ = "document_roles"
    __table_args__ = (
        UniqueConstraint("document_id", "role_id", name="uq_document_role"),
        {"extend_existing": True},
    )

    document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(UUID(as_uuid=False), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True)
    access_level = Column(String(20), nullable=False, default="READ")  # READ, WRITE, ADMIN

    document = relationship("Document", back_populates="role_accesses")
    role = relationship("Role", back_populates="document_accesses")
