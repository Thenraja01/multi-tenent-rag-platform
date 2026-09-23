from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User, Domain, DomainModule
from app.models.platform_models import Module
from app.services.audit_service import audit_service

router = APIRouter(prefix="/domains", tags=["Domains"])


class DomainCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    module_ids: Optional[List[str]] = Field(default_factory=list)


class DomainUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    module_ids: Optional[List[str]] = None


class ToggleModuleRequest(BaseModel):
    enabled: bool = True


@router.get("")
async def list_domains(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List domains belonging to the authenticated user's organization or all platform domains."""
    if current_user.organization_id:
        stmt = select(Domain).where(Domain.organization_id == current_user.organization_id)
    else:
        stmt = select(Domain)
    res = await db.execute(stmt)
    domains = res.scalars().all()

    # Pre-fetch attached modules
    dm_stmt = (
        select(DomainModule.domain_id, Module.id, Module.name, Module.slug, DomainModule.enabled)
        .join(Module, Module.id == DomainModule.module_id)
        .where(Module.is_active == True)
    )
    dm_res = await db.execute(dm_stmt)
    dm_map: Dict[str, List[Dict[str, Any]]] = {}
    for did, mid, mname, mslug, menabled in dm_res.all():
        did_str = str(did)
        if did_str not in dm_map:
            dm_map[did_str] = []
        dm_map[did_str].append({
            "id": str(mid),
            "name": mname,
            "slug": mslug,
            "enabled": menabled,
        })

    return [
        {
            "id": str(d.id),
            "name": d.name,
            "slug": d.slug,
            "description": d.description,
            "status": d.status,
            "organization_id": str(d.organization_id) if d.organization_id else None,
            "modules": dm_map.get(str(d.id), []),
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in domains
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_domain(
    payload: DomainCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a domain and attach selected modules."""
    if current_user.organization_id:
        existing = await db.execute(
            select(Domain).where(
                Domain.organization_id == current_user.organization_id,
                Domain.slug == payload.slug.lower(),
            )
        )
    else:
        existing = await db.execute(
            select(Domain).where(
                Domain.slug == payload.slug.lower(),
            )
        )

    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Domain slug '{payload.slug}' already exists",
        )

    domain = Domain(
        organization_id=current_user.organization_id,
        name=payload.name,
        slug=payload.slug.lower(),
        description=payload.description,
        status=payload.status or "ACTIVE",
    )
    db.add(domain)
    await db.flush()
    domain_id = str(domain.id)

    # Attach modules: either selected ones or all active modules if none specified
    if payload.module_ids and len(payload.module_ids) > 0:
        for mid in payload.module_ids:
            db.add(DomainModule(domain_id=domain.id, module_id=mid, enabled=True))
    else:
        modules = (await db.execute(select(Module).where(Module.is_active == True))).scalars().all()
        for mod in modules:
            db.add(DomainModule(domain_id=domain.id, module_id=mod.id, enabled=True))

    await db.commit()

    await audit_service.log_event(
        db=db,
        action="DOMAIN_CREATED",
        organization_id=str(current_user.organization_id) if current_user.organization_id else None,
        actor_id=str(current_user.id),
        resource_type="domain",
        resource_id=domain_id,
        metadata={"name": payload.name, "slug": payload.slug},
    )

    return {
        "id": domain_id,
        "name": payload.name,
        "slug": payload.slug.lower(),
        "description": payload.description,
        "status": payload.status or "ACTIVE",
    }


@router.get("/{domain_id}")
async def get_domain(
    domain_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get domain details."""
    domain = await db.get(Domain, domain_id)
    if not domain or (current_user.organization_id and str(domain.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")
    return {
        "id": str(domain.id),
        "name": domain.name,
        "slug": domain.slug,
        "description": domain.description,
        "status": domain.status,
    }


@router.put("/{domain_id}")
async def update_domain(
    domain_id: str,
    payload: DomainUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update domain details and assigned modules."""
    domain = await db.get(Domain, domain_id)
    if not domain or (current_user.organization_id and str(domain.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")

    if payload.name is not None:
        domain.name = payload.name
    if payload.slug is not None:
        domain.slug = payload.slug.lower()
    if payload.description is not None:
        domain.description = payload.description
    if payload.status is not None:
        domain.status = payload.status

    if payload.module_ids is not None:
        # Re-sync domain modules
        await db.execute(delete(DomainModule).where(DomainModule.domain_id == domain.id))
        for mid in payload.module_ids:
            db.add(DomainModule(domain_id=domain.id, module_id=mid, enabled=True))

    await db.commit()
    return {
        "id": str(domain.id),
        "name": domain.name,
        "slug": domain.slug,
        "description": domain.description,
        "status": domain.status,
    }


@router.delete("/{domain_id}")
async def delete_domain(
    domain_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Deactivate domain."""
    domain = await db.get(Domain, domain_id)
    if not domain or (current_user.organization_id and str(domain.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")

    domain.status = "INACTIVE"
    await db.commit()
    return {"message": "Domain deactivated successfully"}


@router.get("/{domain_id}/modules")
async def list_domain_modules(
    domain_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List modules enabled for this domain."""
    domain = await db.get(Domain, domain_id)
    if not domain or (current_user.organization_id and str(domain.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")

    stmt = (
        select(Module, DomainModule)
        .join(DomainModule, DomainModule.module_id == Module.id)
        .where(DomainModule.domain_id == domain.id, Module.is_active == True)
        .order_by(DomainModule.sort_order)
    )
    res = await db.execute(stmt)
    return [
        {
            "id": str(mod.id),
            "name": mod.name,
            "slug": mod.slug,
            "module_type": mod.module_type,
            "description": mod.description,
            "enabled": dm.enabled,
        }
        for mod, dm in res.all()
    ]


@router.post("/{domain_id}/modules/{module_id}/toggle")
async def toggle_domain_module(
    domain_id: str,
    module_id: str,
    payload: ToggleModuleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle a module on or off for a domain."""
    domain = await db.get(Domain, domain_id)
    if not domain or (current_user.organization_id and str(domain.organization_id) != str(current_user.organization_id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")

    stmt = select(DomainModule).where(DomainModule.domain_id == domain.id, DomainModule.module_id == module_id)
    res = await db.execute(stmt)
    dm = res.scalar_one_or_none()
    if not dm:
        dm = DomainModule(domain_id=domain.id, module_id=module_id, enabled=payload.enabled)
        db.add(dm)
    else:
        dm.enabled = payload.enabled

    await db.commit()
    return {"message": f"Module status updated to enabled={payload.enabled}"}
