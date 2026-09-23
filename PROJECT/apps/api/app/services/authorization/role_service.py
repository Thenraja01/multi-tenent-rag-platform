from typing import List, Optional
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.identity_models import Role, UserRole


class RoleService:
    @staticmethod
    async def get_tenant_roles(db: AsyncSession, organization_id: Optional[str]) -> List[Role]:
        if organization_id:
            stmt = select(Role).where(
                or_(Role.organization_id == organization_id, Role.organization_id.is_(None)),
                Role.is_active == True,
            )
        else:
            stmt = select(Role).where(Role.is_active == True)
        res = await db.execute(stmt)
        return list(res.scalars().all())


role_service = RoleService()
