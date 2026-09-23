from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.platform_models import Pack, PackModule, Module

router = APIRouter(prefix="/packs", tags=["Platform Packs"])


class PackCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    is_active: bool = True
    module_ids: Optional[List[str]] = None


class PackUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    module_ids: Optional[List[str]] = None


@router.get("")
@router.get("/")
async def list_packs(db: AsyncSession = Depends(get_db)):
    """List all available platform packs and their bundled modules."""
    stmt = select(Pack).options(
        selectinload(Pack.pack_modules).selectinload(PackModule.module)
    ).order_by(Pack.name)
    res = await db.execute(stmt)
    packs = res.scalars().all()
    
    result = []
    for p in packs:
        modules = [
            {
                "id": str(pm.module.id),
                "name": pm.module.name,
                "slug": pm.module.slug,
                "module_type": pm.module.module_type,
                "is_required": pm.is_required,
                "sort_order": pm.sort_order,
            }
            for pm in (p.pack_modules or [])
            if pm.module
        ]
        result.append({
            "id": str(p.id),
            "name": p.name,
            "slug": p.slug,
            "description": p.description,
            "is_active": p.is_active,
            "modules": modules,
            "modules_count": len(modules),
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return result


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_pack(payload: PackCreate, db: AsyncSession = Depends(get_db)):
    """SuperAdmin creates a new domain/feature pack."""
    existing = await db.execute(select(Pack).where(Pack.slug == payload.slug.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pack with slug '{payload.slug}' already exists",
        )

    pack = Pack(
        name=payload.name,
        slug=payload.slug.lower(),
        description=payload.description,
        is_active=payload.is_active,
    )
    db.add(pack)
    await db.flush()

    if payload.module_ids:
        for idx, mod_id in enumerate(payload.module_ids):
            db.add(PackModule(
                pack_id=pack.id,
                module_id=mod_id,
                sort_order=idx,
                is_required=True,
            ))

    await db.commit()
    await db.refresh(pack)
    return {
        "id": str(pack.id),
        "name": pack.name,
        "slug": pack.slug,
        "description": pack.description,
        "is_active": pack.is_active,
    }


@router.get("/{pack_id}")
async def get_pack(pack_id: str, db: AsyncSession = Depends(get_db)):
    """Get single pack details by ID or slug."""
    stmt = (
        select(Pack)
        .options(selectinload(Pack.pack_modules).selectinload(PackModule.module))
        .where((Pack.id == pack_id) | (Pack.slug == pack_id.lower()))
    )
    res = await db.execute(stmt)
    pack = res.scalar_one_or_none()
    if not pack:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pack not found")

    modules = [
        {
            "id": str(pm.module.id),
            "name": pm.module.name,
            "slug": pm.module.slug,
            "module_type": pm.module.module_type,
            "is_required": pm.is_required,
            "sort_order": pm.sort_order,
        }
        for pm in (pack.pack_modules or [])
        if pm.module
    ]
    return {
        "id": str(pack.id),
        "name": pack.name,
        "slug": pack.slug,
        "description": pack.description,
        "is_active": pack.is_active,
        "modules": modules,
        "modules_count": len(modules),
        "created_at": pack.created_at.isoformat() if pack.created_at else None,
    }


@router.put("/{pack_id}")
async def update_pack(pack_id: str, payload: PackUpdate, db: AsyncSession = Depends(get_db)):
    """Update pack metadata and assigned modules."""
    stmt = select(Pack).where((Pack.id == pack_id) | (Pack.slug == pack_id.lower()))
    res = await db.execute(stmt)
    pack = res.scalar_one_or_none()
    if not pack:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pack not found")

    if payload.name is not None:
        pack.name = payload.name
    if payload.description is not None:
        pack.description = payload.description
    if payload.is_active is not None:
        pack.is_active = payload.is_active

    if payload.module_ids is not None:
        # Clear existing pack modules
        pm_res = await db.execute(select(PackModule).where(PackModule.pack_id == pack.id))
        for pm in pm_res.scalars().all():
            await db.delete(pm)
        await db.flush()

        # Add updated modules
        for idx, mod_id in enumerate(payload.module_ids):
            db.add(PackModule(
                pack_id=pack.id,
                module_id=mod_id,
                sort_order=idx,
                is_required=True,
            ))

    await db.commit()
    await db.refresh(pack)
    return {
        "id": str(pack.id),
        "name": pack.name,
        "slug": pack.slug,
        "description": pack.description,
        "is_active": pack.is_active,
    }


@router.delete("/{pack_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pack(pack_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a pack."""
    stmt = select(Pack).where((Pack.id == pack_id) | (Pack.slug == pack_id.lower()))
    res = await db.execute(stmt)
    pack = res.scalar_one_or_none()
    if not pack:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pack not found")

    await db.delete(pack)
    await db.commit()
    return None
