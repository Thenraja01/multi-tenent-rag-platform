import uuid
from datetime import datetime, date, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.models.knowledge_models import Document
from app.services.rag_service import SecureRAGService
from app.services.audit_service import audit_service

router = APIRouter(prefix="/legal", tags=["Legal & Compliance Module"])


# --- Schemas ---
class ContractCreateRequest(BaseModel):
    title: str = Field(..., min_length=2)
    counterparty: str
    contract_type: str = "NDA"
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    document_id: Optional[str] = None
    clauses: Optional[Dict[str, Any]] = None


class LegalReviewRequest(BaseModel):
    document_id: Optional[str] = None
    query: str = "Identify any high-risk liability clauses, indemnification obligations, and termination conditions."


# --- Endpoints ---

@router.get("/contracts")
async def list_contracts(
    contract_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List legal contracts and agreements registered under organization."""
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = (
        select(Document)
        .where(Document.organization_id == current_user.organization_id)
        .order_by(Document.created_at.desc())
    )
    res = await db.execute(stmt)
    docs = res.scalars().all()

    return [
        {
            "id": str(d.id),
            "title": d.filename,
            "filename": d.filename,
            "contract_type": contract_type or "AGREEMENT",
            "file_size": d.file_size,
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in docs
    ]


@router.post("/review")
async def run_legal_review(
    payload: LegalReviewRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Execute AI-powered compliance and legal clause review on documents.
    """
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    rag_result = await SecureRAGService.answer_query(
        db=db,
        user_id=str(current_user.id),
        organization_id=str(current_user.organization_id),
        query_text=payload.query,
        top_k=5,
    )

    await audit_service.log_event(
        db=db,
        action="LEGAL_REVIEW_EXECUTED",
        organization_id=str(current_user.organization_id),
        actor_id=str(current_user.id),
        resource_type="legal_contract",
        metadata={"query": payload.query, "citations": len(rag_result.get("citations", []))},
    )

    return {
        "status": "COMPLETED",
        "review_summary": rag_result.get("answer"),
        "citations": rag_result.get("citations", []),
        "model": rag_result.get("model"),
    }
