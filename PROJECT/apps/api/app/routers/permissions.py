from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.platform_models import Permission

router = APIRouter(prefix="/permissions", tags=["Permissions"])


class PermissionCreate(BaseModel):
    resource: str
    action: str
    permission_key: str
    description: Optional[str] = None


@router.get("")
async def list_permissions(db: AsyncSession = Depends(get_db)):
    """List all defined system permission keys and actions."""
    res = await db.execute(select(Permission))
    perms = res.scalars().all()
    return [
        {
            "id": str(p.id),
            "resource": p.resource,
            "action": p.action,
            "permission_key": p.permission_key,
            "description": p.description,
        }
        for p in perms
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_permission(
    payload: PermissionCreate,
    db: AsyncSession = Depends(get_db),
):
    """SuperAdmin registers a system permission key."""
    existing = await db.execute(
        select(Permission).where(Permission.permission_key == payload.permission_key.lower())
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Permission key '{payload.permission_key}' already exists",
        )

    perm = Permission(
        resource=payload.resource,
        action=payload.action,
        permission_key=payload.permission_key.lower(),
        description=payload.description,
    )
    db.add(perm)
    await db.commit()
    await db.refresh(perm)
    return perm
