import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select, and_, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.models.it_models import ITTicket, ITRunbook
from app.services.audit_service import audit_service

router = APIRouter(prefix="/it", tags=["IT Domain & Operations"])


class TicketCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=250)
    description: str = Field(..., min_length=5)
    priority: str = Field("MEDIUM", description="LOW, MEDIUM, HIGH, CRITICAL")
    category: Optional[str] = "SYSTEM"
    system_impact: Optional[str] = None
    ai_generated: Optional[bool] = False


class TicketUpdate(BaseModel):
    status: Optional[str] = Field(None, description="OPEN, IN_PROGRESS, RESOLVED, CLOSED")
    priority: Optional[str] = None
    resolution_notes: Optional[str] = None
    assigned_to: Optional[str] = None


class RunbookCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    category: str = "INFRASTRUCTURE"
    steps: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    content: str


@router.get("/tickets")
async def list_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List IT incident tickets for current tenant."""
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = select(ITTicket).where(ITTicket.organization_id == current_user.organization_id)
    if status_filter:
        stmt = stmt.where(ITTicket.status == status_filter.upper())
    stmt = stmt.order_by(desc(ITTicket.created_at))

    res = await db.execute(stmt)
    tickets = res.scalars().all()

    return {
        "organization_id": str(current_user.organization_id),
        "total_count": len(tickets),
        "tickets": [
            {
                "id": str(t.id),
                "ticket_number": t.ticket_number,
                "title": t.title,
                "description": t.description,
                "priority": t.priority,
                "category": t.category,
                "status": t.status,
                "created_by": t.created_by_name,
                "assigned_to": t.assigned_to,
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "ai_generated": t.ai_generated,
                "resolution_notes": t.resolution_notes,
            }
            for t in tickets
        ],
    }


@router.post("/tickets", status_code=status.HTTP_201_CREATED)
async def create_ticket(
    payload: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new IT incident ticket in database."""
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    # Count existing tickets for number sequence
    count_stmt = select(func.count(ITTicket.id)).where(ITTicket.organization_id == current_user.organization_id)
    total = (await db.execute(count_stmt)).scalar() or 0
    ticket_num = f"INC-{datetime.now().year}-{total + 101:03d}"

    ticket = ITTicket(
        organization_id=current_user.organization_id,
        ticket_number=ticket_num,
        title=payload.title,
        description=payload.description,
        priority=payload.priority.upper(),
        category=payload.category.upper() if payload.category else "SYSTEM",
        status="OPEN",
        created_by_user_id=current_user.id,
        created_by_name=current_user.full_name or current_user.email,
        assigned_to="Unassigned",
        ai_generated=payload.ai_generated or False,
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    await audit_service.log_event(
        db=db,
        action="IT_TICKET_CREATED",
        organization_id=str(current_user.organization_id),
        actor_id=str(current_user.id),
        resource_type="it_ticket",
        resource_id=str(ticket.id),
        metadata={"title": payload.title, "priority": payload.priority},
    )

    return {
        "id": str(ticket.id),
        "ticket_number": ticket.ticket_number,
        "title": ticket.title,
        "description": ticket.description,
        "priority": ticket.priority,
        "category": ticket.category,
        "status": ticket.status,
        "created_by": ticket.created_by_name,
        "assigned_to": ticket.assigned_to,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "ai_generated": ticket.ai_generated,
    }


@router.patch("/tickets/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    payload: TicketUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update ticket status or assign engineer."""
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = select(ITTicket).where(
        ITTicket.id == ticket_id,
        ITTicket.organization_id == current_user.organization_id,
    )
    res = await db.execute(stmt)
    ticket = res.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if payload.status:
        ticket.status = payload.status.upper()
    if payload.priority:
        ticket.priority = payload.priority.upper()
    if payload.assigned_to:
        ticket.assigned_to = payload.assigned_to
    if payload.resolution_notes:
        ticket.resolution_notes = payload.resolution_notes

    await db.commit()
    await db.refresh(ticket)

    return {
        "id": str(ticket.id),
        "ticket_number": ticket.ticket_number,
        "title": ticket.title,
        "status": ticket.status,
        "priority": ticket.priority,
        "assigned_to": ticket.assigned_to,
        "resolution_notes": ticket.resolution_notes,
    }


@router.get("/runbooks")
async def list_runbooks(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List technical runbooks and troubleshooting procedures from database."""
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    stmt = select(ITRunbook).where(ITRunbook.organization_id == current_user.organization_id)
    if category:
        stmt = stmt.where(ITRunbook.category == category.upper())
    stmt = stmt.order_by(desc(ITRunbook.created_at))

    res = await db.execute(stmt)
    runbooks = res.scalars().all()

    return {
        "total_count": len(runbooks),
        "runbooks": [
            {
                "id": str(rb.id),
                "title": rb.title,
                "category": rb.category,
                "steps": rb.steps or [],
                "tags": rb.tags or [],
                "content": rb.content,
                "created_at": rb.created_at.isoformat() if rb.created_at else None,
            }
            for rb in runbooks
        ],
    }


@router.post("/runbooks", status_code=status.HTTP_201_CREATED)
async def create_runbook(
    payload: RunbookCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Publish a new IT runbook procedure to database."""
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant organization context required")

    rb = ITRunbook(
        organization_id=current_user.organization_id,
        title=payload.title,
        category=payload.category.upper(),
        steps=payload.steps,
        tags=payload.tags,
        content=payload.content,
    )
    db.add(rb)
    await db.commit()
    await db.refresh(rb)

    return {
        "id": str(rb.id),
        "title": rb.title,
        "category": rb.category,
        "steps": rb.steps,
        "tags": rb.tags,
        "content": rb.content,
    }
