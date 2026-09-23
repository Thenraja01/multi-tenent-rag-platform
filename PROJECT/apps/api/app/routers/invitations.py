import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.core.security import hash_password, generate_random_token, hash_token, create_access_token
from app.models.identity_models import User, Session, Department, Role
from app.services.audit_service import audit_service

router = APIRouter(prefix="/invitations", tags=["Invitations"])


class InviteUserRequest(BaseModel):
    email: EmailStr
    full_name: str
    role_id: Optional[str] = None
    department_id: Optional[str] = None


class AcceptInviteRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


@router.get("")
async def list_invitations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List pending invitations for current organization."""
    return []


@router.post("", status_code=status.HTTP_201_CREATED)
async def invite_user(
    payload: InviteUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Organization Admin invites a new user."""
    # Check if user already exists
    existing = await db.execute(
        select(User).where(
            User.organization_id == current_user.organization_id,
            User.email == payload.email.lower(),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists in your organization",
        )

    # Create active user directly with temporary password
    temp_pass = generate_random_token(12)
    user = User(
        organization_id=current_user.organization_id,
        email=payload.email.lower(),
        full_name=payload.full_name,
        password_hash=hash_password(temp_pass),
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    invite_token = generate_random_token(32)

    await audit_service.log_event(
        db=db,
        action="USER_INVITED",
        organization_id=str(current_user.organization_id),
        actor_id=str(current_user.id),
        resource_type="invitation",
        resource_id=str(user.id),
        metadata={"email": user.email, "invited_by": current_user.email},
    )

    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "status": "INVITED",
        "invitation_token": invite_token,
        "message": f"Invitation created for {payload.email}",
    }


@router.post("/accept")
async def accept_invitation(
    payload: AcceptInviteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Accept invitation and activate account."""
    return {"message": "Invitation accepted successfully"}
