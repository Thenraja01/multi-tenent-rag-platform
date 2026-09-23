from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.services.rag_service import SecureRAGService
from app.services.authorization import get_request_context, RequestContext, authorize

router = APIRouter(prefix="/rag", tags=["Zero-Trust RAG"])


class RAGQueryPayload(BaseModel):
    query: str
    domain_id: Optional[str] = None
    top_k: Optional[int] = 5


@router.post("/query")
async def execute_rag_query(
    payload: RAGQueryPayload,
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Execute zero-trust ACL pre-filtered RAG search."""
    authorize(ctx, "rag", "query", module_slug="ai")

    query_emb = await SecureRAGService.get_embedding(payload.query)
    chunks = await SecureRAGService.retrieve_relevant_chunks(
        db=db,
        user_id=str(current_user.id),
        organization_id=str(current_user.organization_id) if current_user.organization_id else "",
        domain_id=payload.domain_id,
        query_embedding=query_emb,
        top_k=payload.top_k or 5,
    )

    return {
        "query": payload.query,
        "results_count": len(chunks),
        "chunks": chunks,
    }
