from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.models.knowledge_models import Document, DocumentChunk
from app.models.rag_models import RAGQuery, RAGQuerySource
from app.services.rag_service import rag_service
from app.services.audit_service import audit_service
from app.routers.documents import list_documents, upload_document, approve_and_ingest_document, reject_document

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base & RAG Engine"])


class RAGQueryRequest(BaseModel):
    query: str = Field(..., min_length=2)
    domain_id: Optional[str] = None
    domain_slug: Optional[str] = None
    top_k: int = 5
    conversation_id: Optional[str] = None


class RAGStreamQueryRequest(BaseModel):
    query: str = Field(..., min_length=2)
    domain_id: Optional[str] = None
    domain_slug: Optional[str] = None
    top_k: int = 5
    conversation_id: Optional[str] = None


@router.post("/query")
async def execute_rag_query(
    payload: RAGQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Execute strict ACL-isolated RAG retrieval and synthesis.
    Only searches documents the user is explicitly authorized to view.
    """
    result = await rag_service.answer_query(
        db=db,
        user_id=str(current_user.id),
        organization_id=str(current_user.organization_id),
        query_text=payload.query,
        domain_id=payload.domain_id,
        domain_slug=payload.domain_slug,
        top_k=payload.top_k,
        conversation_id=payload.conversation_id,
    )

    await audit_service.log_event(
        db=db,
        action="RAG_QUERY_EXECUTED",
        organization_id=str(current_user.organization_id),
        actor_id=str(current_user.id),
        resource_type="rag_query",
        metadata={"query": payload.query, "sources_count": len(result.get("sources", []))},
    )

    return result


@router.post("/stream")
async def execute_rag_stream(
    payload: RAGStreamQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Execute streaming Zero-Trust RAG retrieval with Server-Sent Events (SSE).
    Returns real-time token stream and grounded citations.
    """
    return StreamingResponse(
        rag_service.stream_answer_query(
            db=db,
            user_id=str(current_user.id),
            organization_id=str(current_user.organization_id),
            query_text=payload.query,
            domain_id=payload.domain_id,
            domain_slug=payload.domain_slug,
            top_k=payload.top_k,
            conversation_id=payload.conversation_id,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/documents")
async def list_knowledge_documents(
    domain_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Alias for documents list under knowledge base namespace."""
    return await list_documents(domain_id=domain_id, status=status, current_user=current_user, db=db)


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_knowledge_document(
    file: UploadFile = File(...),
    domain_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Alias for document upload under knowledge base namespace."""
    return await upload_document(file=file, domain_id=domain_id, current_user=current_user, db=db)


@router.post("/documents/{document_id}/approve")
async def approve_knowledge_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Alias for approving document and indexing into RAG under knowledge base namespace."""
    return await approve_and_ingest_document(document_id=document_id, current_user=current_user, db=db)


@router.post("/documents/{document_id}/reject")
async def reject_knowledge_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Alias for rejecting document under knowledge base namespace."""
    return await reject_document(document_id=document_id, current_user=current_user, db=db)

