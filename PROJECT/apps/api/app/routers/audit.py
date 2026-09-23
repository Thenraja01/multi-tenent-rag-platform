from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User, Department, UserDepartment, Role, UserRole, Domain
from app.models.organization_models import Organization
from app.models.platform_models import PlatformAdmin
from app.models.system_models import AuditLog

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get("")
@router.get("/logs")
async def list_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    action: Optional[str] = None,
    category: Optional[str] = None,
    organization_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List activity logs with full entity resolution: Actor, Tenant, Department, Domain, Resource."""
    stmt = select(AuditLog)
    if current_user.organization_id:
        stmt = stmt.where(AuditLog.organization_id == current_user.organization_id)
    elif organization_id:
        stmt = stmt.where(AuditLog.organization_id == organization_id)

    if action:
        stmt = stmt.where(AuditLog.action.ilike(f"%{action}%"))
    if category:
        if category == "AUTH":
            stmt = stmt.where(AuditLog.action.in_(["USER_LOGIN", "USER_LOGOUT", "PASSWORD_CHANGED", "USER_CREATED", "USER_INVITED", "USER_ACTIVATED", "USER_SUSPENDED"]))
        elif category == "DOCUMENTS":
            stmt = stmt.where(AuditLog.action.in_(["DOCUMENT_UPLOADED", "DOCUMENT_APPROVED_AND_INGESTED", "DOCUMENT_REJECTED", "DOCUMENT_DELETED", "DOCUMENT_ACCESS_CHANGED"]))
        elif category == "RBAC":
            stmt = stmt.where(AuditLog.action.in_(["ROLE_ASSIGNED", "ROLE_REVOKED", "ROLE_CREATED", "PERMISSION_GRANTED"]))
        elif category == "ORGANIZATION":
            stmt = stmt.where(AuditLog.action.in_(["ORGANIZATION_CREATED", "ORGANIZATION_UPDATED", "ORGANIZATION_APPROVED", "ORGANIZATION_SUSPENDED", "PACK_ASSIGNED"]))

    stmt = stmt.order_by(AuditLog.created_at.desc()).limit(limit)
    res = await db.execute(stmt)
    logs = res.scalars().all()

    if not logs:
        return []

    # Collect IDs for batch resolution
    actor_ids = {str(l.actor_id) for l in logs if l.actor_id}
    org_ids = {str(l.organization_id) for l in logs if l.organization_id}

    # 1. Fetch Users & Platform Admins
    user_map: Dict[str, Dict[str, Any]] = {}
    if actor_ids:
        u_stmt = (
            select(User)
            .options(
                selectinload(User.user_departments).selectinload(UserDepartment.department),
                selectinload(User.user_roles).selectinload(UserRole.role),
            )
            .where(User.id.in_(actor_ids))
        )
        u_res = await db.execute(u_stmt)
        for u in u_res.scalars().all():
            dept_names = [ud.department.name for ud in u.user_departments if ud.department]
            role_names = [ur.role.name for ur in u.user_roles if ur.role]
            role_str = ", ".join(role_names) if role_names else ("Org Admin" if u.is_org_admin else "Member")
            dept_str = ", ".join(dept_names) if dept_names else None
            user_map[str(u.id)] = {
                "name": u.full_name,
                "email": u.email,
                "role": role_str,
                "department": dept_str,
                "is_superadmin": False,
            }

        # Check PlatformAdmins
        pa_stmt = select(PlatformAdmin).where(PlatformAdmin.id.in_(actor_ids))
        pa_res = await db.execute(pa_stmt)
        for pa in pa_res.scalars().all():
            user_map[str(pa.id)] = {
                "name": pa.full_name or "SuperAdmin",
                "email": pa.email,
                "role": "Platform SuperAdmin",
                "department": "Platform Core",
                "is_superadmin": True,
            }

    # 2. Fetch Organizations
    org_map: Dict[str, Dict[str, Any]] = {}
    if org_ids:
        o_stmt = select(Organization).where(Organization.id.in_(org_ids))
        o_res = await db.execute(o_stmt)
        for o in o_res.scalars().all():
            org_map[str(o.id)] = {
                "name": o.name,
                "slug": o.slug,
            }

    # Format enriched items
    results = []
    for log in logs:
        actor_info = user_map.get(str(log.actor_id)) if log.actor_id else None
        org_info = org_map.get(str(log.organization_id)) if log.organization_id else None
        meta = getattr(log, "metadata_json", {}) or {}

        # Resolve actor attributes
        actor_name = actor_info["name"] if actor_info else meta.get("actor_name") or meta.get("name") or "System Automated"
        actor_email = actor_info["email"] if actor_info else meta.get("actor_email") or meta.get("email") or "system@platform.local"
        actor_role = actor_info["role"] if actor_info else meta.get("actor_role") or "System Service"

        # Resolve organization attributes
        org_name = org_info["name"] if org_info else meta.get("organization_name") or meta.get("tenant_name") or ("Platform Level" if not log.organization_id else "Global")
        org_slug = org_info["slug"] if org_info else meta.get("organization_slug") or meta.get("tenant_slug") or None

        # Resolve department & domain
        dept_name = meta.get("department_name") or (actor_info.get("department") if actor_info else None) or meta.get("dept") or "-"
        domain_name = meta.get("domain_name") or meta.get("domain_slug") or meta.get("domain") or "-"

        # Resolve human-readable resource name
        resource_name = meta.get("filename") or meta.get("resource_name") or meta.get("title") or meta.get("name") or meta.get("email") or (f"{log.resource_type}:{str(log.resource_id)[:8]}" if log.resource_type and log.resource_id else "-")

        results.append({
            "id": str(log.id),
            "action": log.action,
            "actor_id": str(log.actor_id) if log.actor_id else None,
            "actor_name": actor_name,
            "actor_email": actor_email,
            "actor_role": actor_role,
            "organization_id": str(log.organization_id) if log.organization_id else None,
            "organization_name": org_name,
            "organization_slug": org_slug,
            "department_name": dept_name,
            "domain_name": domain_name,
            "resource_type": log.resource_type or "system",
            "resource_id": str(log.resource_id) if log.resource_id else None,
            "resource_name": resource_name,
            "ip_address": log.ip_address or "127.0.0.1",
            "user_agent": log.user_agent,
            "metadata": meta,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        })

    return results
