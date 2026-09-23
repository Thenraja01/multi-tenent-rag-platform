from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.platform_models import Module, PackModule
from app.models.organization_models import OrganizationPack
from app.services.permission_service import PermissionService


class ModuleService:
    @staticmethod
    async def get_allowed_modules(
        db: AsyncSession,
        user_id: str,
        organization_id: Optional[str] = None,
    ) -> List[Module]:
        if not organization_id:
            res = await db.execute(select(Module).where(Module.is_active == True))
            return list(res.scalars().all())

        stmt = (
            select(Module)
            .join(PackModule, PackModule.module_id == Module.id)
            .join(OrganizationPack, OrganizationPack.pack_id == PackModule.pack_id)
            .where(
                OrganizationPack.organization_id == organization_id,
                OrganizationPack.is_active == True,
                Module.is_active == True,
            )
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())


module_service = ModuleService()
