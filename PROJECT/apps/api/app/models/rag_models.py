import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Numeric,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class RAGQuery(Base):
    __tablename__ = "rag_queries"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    domain_id = Column(UUID(as_uuid=False), ForeignKey("domains.id", ondelete="CASCADE"), nullable=True, index=True)
    query_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=True)
    model_name = Column(String(150), nullable=True)
    input_tokens = Column(Integer, nullable=True)
    output_tokens = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    status = Column(String(30), nullable=False, default="COMPLETED", index=True)

    # Relationships
    organization = relationship("Organization", back_populates="rag_queries")
    user = relationship("User", back_populates="rag_queries")
    domain = relationship("Domain", back_populates="rag_queries")
    sources = relationship("RAGQuerySource", back_populates="query", cascade="all, delete-orphan")


class RAGQuerySource(Base):
    __tablename__ = "rag_query_sources"
    __table_args__ = (
        UniqueConstraint("query_id", "chunk_id", name="uq_rag_query_source"),
        {"extend_existing": True},
    )

    query_id = Column(UUID(as_uuid=False), ForeignKey("rag_queries.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_id = Column(UUID(as_uuid=False), ForeignKey("document_chunks.id", ondelete="CASCADE"), nullable=False, index=True)
    similarity_score = Column(Numeric(5, 4), nullable=True)
    citation_order = Column(Integer, nullable=False, default=1)
    query = relationship("RAGQuery", back_populates="sources")
    chunk = relationship("DocumentChunk", back_populates="query_sources")


class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    domain_id = Column(UUID(as_uuid=False), ForeignKey("domains.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(300), nullable=False, default="New Consultation")
    pinned = Column(String(10), nullable=False, default="false")

    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan")


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    __table_args__ = {"extend_existing": True}

    conversation_id = Column(UUID(as_uuid=False), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # 'user' | 'assistant' | 'system'
    content = Column(Text, nullable=False)
    citations_json = Column("citations", Text, nullable=True)

    conversation = relationship("Conversation", back_populates="messages")


class AIConfiguration(Base):
    __tablename__ = "ai_configurations"
    __table_args__ = (
        UniqueConstraint("organization_id", "domain_id", name="uq_org_domain_ai_config"),
        {"extend_existing": True},
    )

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    domain_id = Column(UUID(as_uuid=False), ForeignKey("domains.id", ondelete="CASCADE"), nullable=True, index=True)
    provider = Column(String(50), nullable=False, default="ollama")  # 'ollama', 'openai', 'gemini', 'anthropic', 'litellm'
    model = Column(String(100), nullable=False, default="llama3.2")
    embedding_model = Column(String(100), nullable=False, default="nomic-embed-text")
    fallback_provider = Column(String(50), nullable=True, default="ollama")
    fallback_model = Column(String(100), nullable=True, default="llama3.2")
    temperature = Column(Numeric(3, 2), nullable=False, default=0.20)
    max_tokens = Column(Integer, nullable=False, default=2048)
    system_prompt = Column(Text, nullable=True)
    rag_top_k = Column(Integer, nullable=False, default=5)
    min_relevance_score = Column(Numeric(4, 3), nullable=False, default=0.500)
    enable_streaming = Column(String(10), nullable=False, default="true")

