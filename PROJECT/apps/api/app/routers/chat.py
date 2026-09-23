import json
import uuid
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.models.rag_models import Conversation, ConversationMessage

logger = logging.getLogger("nexusrag.chat")

router = APIRouter(prefix="/chat", tags=["Persistent Chat Conversations"])


class CreateConversationPayload(BaseModel):
    title: Optional[str] = "New Consultation"
    domain_id: Optional[str] = None


@router.get("/conversations")
async def list_conversations(
    domain_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all conversation threads for current user within the organization."""
    stmt = (
        select(Conversation)
        .where(
            Conversation.organization_id == current_user.organization_id,
            Conversation.user_id == current_user.id,
        )
        .order_by(desc(Conversation.created_at))
    )
    if domain_id:
        stmt = stmt.where(Conversation.domain_id == domain_id)

    res = await db.execute(stmt)
    convos = res.scalars().all()
    return [
        {
            "id": str(c.id),
            "title": c.title,
            "domain_id": str(c.domain_id) if c.domain_id else None,
            "pinned": c.pinned == "true",
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        }
        for c in convos
    ]


@router.post("/conversations", status_code=status.HTTP_201_CREATED)
async def create_conversation(
    payload: CreateConversationPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new persistent conversation thread."""
    convo = Conversation(
        id=str(uuid.uuid4()),
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        domain_id=payload.domain_id,
        title=payload.title or "New Consultation",
        pinned="false",
    )
    db.add(convo)
    await db.commit()
    await db.refresh(convo)
    return {
        "id": str(convo.id),
        "title": convo.title,
        "domain_id": str(convo.domain_id) if convo.domain_id else None,
        "pinned": False,
        "created_at": convo.created_at.isoformat() if convo.created_at else None,
    }


@router.get("/conversations/{conversation_id}")
async def get_conversation_detail(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get conversation thread details with message history and citations."""
    convo = await db.get(Conversation, conversation_id)
    if not convo or str(convo.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    stmt = (
        select(ConversationMessage)
        .where(ConversationMessage.conversation_id == conversation_id)
        .order_by(ConversationMessage.created_at.asc())
    )
    res = await db.execute(stmt)
    msgs = res.scalars().all()
    return {
        "id": str(convo.id),
        "title": convo.title,
        "domain_id": str(convo.domain_id) if convo.domain_id else None,
        "pinned": convo.pinned == "true",
        "created_at": convo.created_at.isoformat() if convo.created_at else None,
        "messages": [
            {
                "id": str(m.id),
                "role": m.role,
                "content": m.content,
                "sources": json.loads(m.citations_json) if m.citations_json else [],
                "citations": json.loads(m.citations_json) if m.citations_json else [],
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in msgs
        ],
    }


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all messages and citations for a conversation thread."""
    convo = await db.get(Conversation, conversation_id)
    if not convo or str(convo.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    stmt = (
        select(ConversationMessage)
        .where(ConversationMessage.conversation_id == conversation_id)
        .order_by(ConversationMessage.created_at.asc())
    )
    res = await db.execute(stmt)
    msgs = res.scalars().all()
    return [
        {
            "id": str(m.id),
            "role": m.role,
            "content": m.content,
            "sources": json.loads(m.citations_json) if m.citations_json else [],
            "citations": json.loads(m.citations_json) if m.citations_json else [],
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in msgs
    ]


@router.post("/query")
async def query_chat_stream(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Execute streaming RAG chat query directly in conversational thread."""
    from fastapi.responses import StreamingResponse
    from app.services.rag_service import rag_service

    query_text = payload.get("query") or payload.get("message") or ""
    conversation_id = payload.get("conversation_id")
    domain_id = payload.get("domain_id")
    domain_slug = payload.get("domain_slug")

    if not query_text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query text is required")

    # If conversation doesn't exist, auto-create one
    if not conversation_id:
        convo = Conversation(
            id=str(uuid.uuid4()),
            organization_id=current_user.organization_id,
            user_id=current_user.id,
            domain_id=domain_id,
            title=query_text[:40] + ("..." if len(query_text) > 40 else ""),
            pinned="false",
        )
        db.add(convo)
        await db.commit()
        await db.refresh(convo)
        conversation_id = str(convo.id)

    return StreamingResponse(
        rag_service.stream_answer_query(
            db=db,
            user_id=str(current_user.id),
            organization_id=str(current_user.organization_id),
            query_text=query_text,
            domain_id=domain_id,
            domain_slug=domain_slug,
            top_k=payload.get("top_k", 5),
            conversation_id=conversation_id,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a conversation thread and its messages."""
    convo = await db.get(Conversation, conversation_id)
    if not convo or str(convo.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    await db.delete(convo)
    await db.commit()
    return {"message": "Conversation deleted successfully"}
