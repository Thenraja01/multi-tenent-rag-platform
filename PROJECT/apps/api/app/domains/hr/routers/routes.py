from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User
from app.domains.hr.schemas.schemas import (
    EmployeeCreate,
    EmployeeResponse,
    LeaveRequestCreate,
)
from app.domains.hr.application.services import HRApplicationService
from app.domains.hr.infrastructure.repository import HRRepository

router = APIRouter(prefix="/hr", tags=["HR & Workforce Operations"])


@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    data: EmployeeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = current_user.organization_id
    employee = await HRApplicationService.create_employee(db, str(org_id), data)
    await db.commit()
    return employee


@router.post("/leaves", status_code=status.HTTP_201_CREATED)
async def apply_leave(
    data: LeaveRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    hr_repo = HRRepository(db)
    emp = await hr_repo.get_by_user_id(current_user.id)
    emp_id = str(emp.id) if emp else str(current_user.id)
    leave = await HRApplicationService.apply_leave(db, str(current_user.organization_id), emp_id, data)
    await db.commit()
    return {"message": "Leave request submitted successfully", "id": str(leave.id)}
