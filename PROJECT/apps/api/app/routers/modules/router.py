from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.platform_models import Module, Feature

router = APIRouter(prefix="/modules", tags=["Modules"])


class ModuleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    module_type: str = "business"
    description: Optional[str] = None


class ModuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("")
@router.get("/catalog")
async def list_modules(db: AsyncSession = Depends(get_db)):
    """List all available platform modules (Leave, Attendance, Documents, RAG, Analytics, etc.)."""
    res = await db.execute(select(Module).where(Module.is_active == True))
    modules = res.scalars().all()
    return [
        {
            "id": str(m.id),
            "name": m.name,
            "slug": m.slug,
            "module_type": m.module_type,
            "description": m.description,
            "is_active": m.is_active,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in modules
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_module(
    payload: ModuleCreate,
    db: AsyncSession = Depends(get_db),
):
    """SuperAdmin registers a new platform module."""
    existing = await db.execute(select(Module).where(Module.slug == payload.slug.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Module slug '{payload.slug}' already exists")

    module = Module(
        name=payload.name,
        slug=payload.slug.lower(),
        module_type=payload.module_type,
        description=payload.description,
    )
    db.add(module)
    await db.commit()
    await db.refresh(module)
    return module


@router.get("/{module_id}")
async def get_module(module_id: str, db: AsyncSession = Depends(get_db)):
    """Get module details."""
    module = await db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    return module


@router.put("/{module_id}")
async def update_module(module_id: str, payload: ModuleUpdate, db: AsyncSession = Depends(get_db)):
    """Update module."""
    module = await db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    if payload.name is not None:
        module.name = payload.name
    if payload.description is not None:
        module.description = payload.description
    if payload.is_active is not None:
        module.is_active = payload.is_active

    await db.commit()
    await db.refresh(module)
    return module
