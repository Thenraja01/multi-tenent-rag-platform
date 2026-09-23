import uuid
from datetime import datetime, date, timezone
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.domains.hr.infrastructure.models import Employee, LeaveRequest, AttendanceRecord, EmployeeProfile
from app.domains.hr.schemas.schemas import EmployeeCreate, LeaveRequestCreate
from app.domains.hr.domain.rules import HRDomainRules
from app.core.exceptions import ResourceNotFoundError, ConflictError


class HRApplicationService:
    @staticmethod
    async def create_employee(session: AsyncSession, organization_id: str, data: EmployeeCreate) -> Employee:
        org_uuid = uuid.UUID(str(organization_id))
        employee = Employee(
            id=uuid.uuid4(),
            organization_id=org_uuid,
            user_id=uuid.UUID(data.user_id) if data.user_id else None,
            department_id=uuid.UUID(data.department_id) if data.department_id else None,
            manager_id=uuid.UUID(data.manager_id) if data.manager_id else None,
            employee_code=data.employee_code,
            employment_status="ACTIVE",
            joining_date=data.joining_date or date.today(),
        )
        session.add(employee)
        await session.flush()

        profile = EmployeeProfile(
            id=uuid.uuid4(),
            employee_id=employee.id,
            job_title=data.job_title or "Staff",
            phone=data.phone,
            location=data.location,
        )
        session.add(profile)
        await session.flush()
        return employee

    @staticmethod
    async def apply_leave(
        session: AsyncSession,
        organization_id: str,
        employee_id: str,
        data: LeaveRequestCreate
    ) -> LeaveRequest:
        if not HRDomainRules.validate_leave_dates(data.start_date, data.end_date):
            raise ConflictError("End date cannot be prior to start date.")

        days = HRDomainRules.calculate_leave_days(data.start_date, data.end_date)
        leave = LeaveRequest(
            id=uuid.uuid4(),
            organization_id=uuid.UUID(str(organization_id)),
            employee_id=uuid.UUID(str(employee_id)),
            leave_type=data.leave_type,
            start_date=data.start_date,
            end_date=data.end_date,
            days_count=days,
            status="PENDING",
            reason=data.reason,
        )
        session.add(leave)
        await session.flush()
        return leave
