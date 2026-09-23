from typing import Optional, List
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.hr_models import Employee, LeaveRequest, AttendanceRecord


class HRRepository(BaseRepository[Employee]):
    def __init__(self, session: AsyncSession):
        super().__init__(Employee, session)

    async def get_by_user_id(self, user_id: uuid.UUID) -> Optional[Employee]:
        result = await self.session.execute(
            select(Employee).where(Employee.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_code(self, organization_id: uuid.UUID, code: str) -> Optional[Employee]:
        result = await self.session.execute(
            select(Employee).where(
                Employee.organization_id == organization_id,
                Employee.employee_code == code
            )
        )
        return result.scalar_one_or_none()
