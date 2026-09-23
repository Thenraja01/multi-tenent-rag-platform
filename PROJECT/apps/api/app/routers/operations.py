import uuid
from datetime import datetime, timezone
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

router = APIRouter(prefix="/operations", tags=["Operations & SOPs Module"])


# --- Schemas ---
class SOPQueryRequest(BaseModel):
    query: str = Field(..., min_length=2)
    category: Optional[str] = "GENERAL"


class IncidentReportRequest(BaseModel):
    title: str = Field(..., min_length=3)
    severity: str = "MEDIUM"
    description: str
    affected_systems: Optional[List[str]] = None


# --- Endpoints ---

@router.get("/sops")
async def list_sops(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List Standard Operating Procedures available to the organization."""
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
            "type": "SOP",
            "file_size": d.file_size,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in docs
    ]


@router.post("/assistant")
async def query_operations_assistant(
    payload: SOPQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query Operations RAG assistant for SOP runbooks, checklists, and process workflows."""
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    rag_result = await SecureRAGService.answer_query(
        db=db,
        user_id=str(current_user.id),
        organization_id=str(current_user.organization_id),
        query_text=f"Operational SOP Procedure: {payload.query}",
        top_k=5,
    )

    await audit_service.log_event(
        db=db,
        action="OPERATIONS_SOP_QUERY",
        organization_id=str(current_user.organization_id),
        actor_id=str(current_user.id),
        resource_type="sop_document",
        metadata={"query": payload.query},
    )

    return {
        "status": "SUCCESS",
        "guidance": rag_result.get("answer"),
        "citations": rag_result.get("citations", []),
        "model": rag_result.get("model"),
    }
