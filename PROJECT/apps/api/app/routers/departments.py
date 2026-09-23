from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User, Department, Role, RolePermission, Domain
from app.models.platform_models import Permission
from app.services.audit_service import audit_service

router = APIRouter(prefix="/departments", tags=["Departments"])


class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    organization_id: Optional[str] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


@router.get("")
async def list_departments(
    organization_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all departments in the organization or platform."""
    target_org_id = organization_id or current_user.organization_id
    if target_org_id:
        stmt = select(Department).where(
            Department.organization_id == target_org_id,
            Department.status == "ACTIVE",
        )
    else:
        stmt = select(Department).where(Department.status == "ACTIVE")
    res = await db.execute(stmt)
    depts = res.scalars().all()
    return [
        {
            "id": str(d.id),
            "name": d.name,
            "slug": d.slug,
            "description": d.description,
            "status": d.status,
            "organization_id": str(d.organization_id),
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in depts
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_department(
    payload: DepartmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new department and automatically provision standard tiered roles:
    - {dept_slug}-admin (Full CRUD + approval permissions)
    - {dept_slug}-manager (Read + write + review permissions)
    - {dept_slug}-member (Read + self-service write permissions)
    - {dept_slug}-viewer (Read-only knowledge access)
    """
    target_org_id = payload.organization_id or current_user.organization_id
    if not target_org_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Organization ID is required")

    existing = await db.execute(
        select(Department).where(
            Department.organization_id == target_org_id,
            Department.slug == payload.slug.lower(),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Department slug '{payload.slug}' already exists in this organization",
        )

    dept = Department(
        organization_id=target_org_id,
        name=payload.name,
        slug=payload.slug.lower(),
        description=payload.description,
        status="ACTIVE",
    )
    db.add(dept)
    await db.flush()

    # Find matching domain if provisioned
    domain_stmt = select(Domain).where(
        or_(
            Domain.organization_id == target_org_id,
            Domain.organization_id.is_(None),
        ),
        Domain.slug == dept.slug,
    )
    domain_res = await db.execute(domain_stmt)
    matched_domain = domain_res.scalars().first()
    domain_id = matched_domain.id if matched_domain else None

    # 4-Tier Department Standard Roles Definition
    clean_slug = dept.slug.lower().strip()
    dept_title = dept.name.strip()

    roles_spec = [
        {
            "suffix": "admin",
            "name": f"{dept_title} Admin",
            "slug": f"{clean_slug}-admin",
            "description": f"Full administrative, member management, and approval authority for {dept_title}.",
            "permissions": [
                f"{clean_slug}:*",
                f"{clean_slug}:manage",
                f"{clean_slug}:create",
                f"{clean_slug}:read",
                f"{clean_slug}:update",
                f"{clean_slug}:delete",
                f"{clean_slug}:approve",
                "rag:query",
                "document:view",
                "document:upload",
                "document:manage",
            ],
        },
        {
            "suffix": "manager",
            "name": f"{dept_title} Manager",
            "slug": f"{clean_slug}-manager",
            "description": f"Operational management, workflow reviews, and approvals for {dept_title}.",
            "permissions": [
                f"{clean_slug}:read",
                f"{clean_slug}:create",
                f"{clean_slug}:update",
                f"{clean_slug}:review",
                f"{clean_slug}:approve",
                "rag:query",
                "document:view",
                "document:upload",
            ],
        },
        {
            "suffix": "member",
            "name": f"{dept_title} Member",
            "slug": f"{clean_slug}-member",
            "description": f"Standard operational member and self-service knowledge access for {dept_title}.",
            "permissions": [
                f"{clean_slug}:read",
                f"{clean_slug}:create",
                "rag:query",
                "document:view",
            ],
        },
        {
            "suffix": "viewer",
            "name": f"{dept_title} Viewer",
            "slug": f"{clean_slug}-viewer",
            "description": f"Read-only knowledge access and AI Copilot queries for {dept_title}.",
            "permissions": [
                f"{clean_slug}:read",
                "rag:query",
                "document:view",
            ],
        },
    ]

    for spec in roles_spec:
        # Check if role already exists
        role_stmt = select(Role).where(
            Role.organization_id == target_org_id,
            Role.slug == spec["slug"],
        )
        existing_role = (await db.execute(role_stmt)).scalars().first()

        if not existing_role:
            role = Role(
                organization_id=target_org_id,
                domain_id=domain_id,
                name=spec["name"],
                slug=spec["slug"],
                description=spec["description"],
                is_system=False,
                is_active=True,
            )
            db.add(role)
            await db.flush()
        else:
            role = existing_role

        # Assign permissions
        for perm_key in spec["permissions"]:
            p_stmt = select(Permission).where(Permission.permission_key == perm_key)
            perm_obj = (await db.execute(p_stmt)).scalars().first()
            if not perm_obj:
                resource_name = perm_key.split(":")[0] if ":" in perm_key else clean_slug
                action_name = perm_key.split(":")[1] if ":" in perm_key else "access"
                perm_obj = Permission(
                    resource=resource_name,
                    action=action_name,
                    permission_key=perm_key,
                    description=f"{perm_key} permission for {dept_title}",
                )
                db.add(perm_obj)
                await db.flush()

            # Link RolePermission
            rp_stmt = select(RolePermission).where(
                RolePermission.role_id == role.id,
                RolePermission.permission_id == perm_obj.id,
            )
            if not (await db.execute(rp_stmt)).scalars().first():
                db.add(RolePermission(role_id=role.id, permission_id=perm_obj.id))

    await db.commit()
    await db.refresh(dept)

    await audit_service.log_event(
        db=db,
        action="DEPARTMENT_CREATED",
        organization_id=str(target_org_id),
        actor_id=str(current_user.id),
        resource_type="department",
        resource_id=str(dept.id),
        metadata={
            "name": dept.name,
            "slug": dept.slug,
            "auto_seeded_roles": [s["slug"] for s in roles_spec],
        },
    )

    return dept


@router.get("/{dept_id}")
async def get_department(
    dept_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve department details."""
    dept = await db.get(Department, dept_id)
    if not dept or str(dept.organization_id) != str(current_user.organization_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    return dept


@router.put("/{dept_id}")
async def update_department(
    dept_id: str,
    payload: DepartmentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update department."""
    dept = await db.get(Department, dept_id)
    if not dept or str(dept.organization_id) != str(current_user.organization_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    if payload.name is not None:
        dept.name = payload.name
    if payload.description is not None:
        dept.description = payload.description
    if payload.status is not None:
        dept.status = payload.status

    await db.commit()
    await db.refresh(dept)
    return dept


@router.delete("/{dept_id}")
async def delete_department(
    dept_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Deactivate department."""
    dept = await db.get(Department, dept_id)
    if not dept or str(dept.organization_id) != str(current_user.organization_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    dept.status = "INACTIVE"
    await db.commit()
    return {"message": "Department deactivated successfully"}
