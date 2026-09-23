import uuid
from datetime import datetime, date, timezone
from typing import Any, Dict, List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.identity_models import User, UserDepartment
from app.models.hr_models import Employee, EmployeeProfile, AttendanceRecord, LeaveRequest
from app.services.permission_service import PermissionService
from app.services.data_scope_service import DataScopeService
from app.services.audit_service import audit_service
from app.services.authorization import get_request_context, RequestContext, authorize

router = APIRouter(prefix="/hr", tags=["HR & People Operations Module"])


# --- Helper ---
async def get_or_create_employee(db: AsyncSession, user: User) -> Employee:
    """Resolve or automatically initialize an Employee record for the user."""
    stmt = (
        select(Employee)
        .options(selectinload(Employee.profile), selectinload(Employee.user), selectinload(Employee.department))
        .where(Employee.user_id == user.id)
    )
    res = await db.execute(stmt)
    emp = res.scalars().first()
    if not emp:
        # Fetch user's primary department if assigned
        ud_stmt = select(UserDepartment.department_id).where(UserDepartment.user_id == user.id)
        ud_res = await db.execute(ud_stmt)
        dept_id = ud_res.scalars().first()

        emp_code = f"EMP-{str(user.id)[:6].upper()}"
        emp = Employee(
            organization_id=user.organization_id,
            user_id=user.id,
            department_id=dept_id,
            employee_code=emp_code,
            employment_status="ACTIVE",
            joining_date=date.today(),
        )
        db.add(emp)
        await db.flush()

        profile = EmployeeProfile(
            employee_id=emp.id,
            job_title="Staff Member",
            location="Headquarters",
        )
        db.add(profile)
        await db.commit()
        await db.refresh(emp)

    return emp


# --- Schemas ---
class EmployeeCreateRequest(BaseModel):
    user_id: Optional[str] = None
    department_id: Optional[str] = None
    manager_id: Optional[str] = None
    employee_code: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    joining_date: Optional[date] = None


class AttendanceCheckInRequest(BaseModel):
    employee_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geofence_verified: bool = True


class LeaveSubmitRequest(BaseModel):
    employee_id: Optional[str] = None
    leave_type: str = "Annual Vacation"
    start_date: date
    end_date: date
    total_days: float = 1.0
    reason: Optional[str] = None


class LeaveActionRequest(BaseModel):
    status: str = "APPROVED"  # APPROVED or REJECTED


# --- Endpoints ---

@router.get("/employees")
async def list_employees(
    department_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all real employees within the organization."""
    authorize(ctx, "employee", "view", module_slug="hr")
    if not current_user.organization_id:
        stmt = select(Employee).options(selectinload(Employee.profile), selectinload(Employee.user), selectinload(Employee.department))
    else:
        stmt = (
            select(Employee)
            .options(selectinload(Employee.profile), selectinload(Employee.user), selectinload(Employee.department))
            .where(Employee.organization_id == current_user.organization_id)
        )
    if department_id:
        stmt = stmt.where(Employee.department_id == department_id)
    if status_filter:
        stmt = stmt.where(Employee.employment_status == status_filter)

    res = await db.execute(stmt)
    employees = res.scalars().all()

    return [
        {
            "id": str(e.id),
            "employee_code": e.employee_code,
            "employment_status": e.employment_status,
            "user_id": str(e.user_id) if e.user_id else None,
            "user_name": e.user.full_name if e.user else None,
            "user_email": e.user.email if e.user else None,
            "department_id": str(e.department_id) if e.department_id else None,
            "department_name": e.department.name if e.department else "General Staff",
            "job_title": e.profile.job_title if e.profile else "Staff",
            "location": e.profile.location if e.profile else "HQ",
            "joining_date": e.joining_date.isoformat() if e.joining_date else None,
        }
        for e in employees
    ]


@router.get("/attendance")
async def list_attendance(
    employee_id: Optional[str] = None,
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List real database attendance records with scope enforcement."""
    authorize(ctx, "attendance", "view", module_slug="hr")
    emp = await get_or_create_employee(db, current_user)
    scope = await DataScopeService.get_resource_scope(db, current_user, "attendance")

    stmt = (
        select(AttendanceRecord, Employee, User)
        .join(Employee, Employee.id == AttendanceRecord.employee_id)
        .outerjoin(User, User.id == Employee.user_id)
        .order_by(AttendanceRecord.attendance_date.desc(), AttendanceRecord.created_at.desc())
        .limit(100)
    )

    if current_user.organization_id:
        stmt = stmt.where(AttendanceRecord.organization_id == current_user.organization_id)

    if scope == "SELF":
        stmt = stmt.where(AttendanceRecord.employee_id == emp.id)
    elif employee_id:
        stmt = stmt.where(AttendanceRecord.employee_id == employee_id)

    res = await db.execute(stmt)
    rows = res.all()

    return [
        {
            "id": str(r[0].id),
            "employee_id": str(r[0].employee_id),
            "employee_name": r[2].full_name if r[2] else (r[1].employee_code if r[1] else "Staff Member"),
            "attendance_date": r[0].attendance_date.isoformat(),
            "check_in": r[0].check_in.strftime("%I:%M %p") if r[0].check_in else None,
            "check_out": r[0].check_out.strftime("%I:%M %p") if r[0].check_out else None,
            "status": r[0].status,
            "geofence_verified": r[0].geofence_verified,
            "duration": "Completed" if r[0].check_out else "In Progress",
        }
        for r in rows
    ]


@router.post("/attendance/check-in")
async def check_in_attendance(
    payload: AttendanceCheckInRequest,
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Record live daily employee check-in / check-out."""
    authorize(ctx, "attendance", "create", module_slug="hr")
    emp = await get_or_create_employee(db, current_user)
    target_emp_id = payload.employee_id or emp.id
    today = date.today()

    stmt = select(AttendanceRecord).where(
        AttendanceRecord.employee_id == target_emp_id,
        AttendanceRecord.attendance_date == today,
    )
    res = await db.execute(stmt)
    existing = res.scalars().first()

    if existing:
        if not existing.check_out:
            existing.check_out = datetime.now(timezone.utc)
            await db.commit()
            return {"message": "Clocked out successfully", "status": "CLOCKED_OUT", "clock_out": existing.check_out.strftime("%I:%M %p")}
        else:
            return {"message": "Already clocked out today", "status": "PRESENT"}

    rec = AttendanceRecord(
        organization_id=current_user.organization_id or emp.organization_id,
        employee_id=target_emp_id,
        attendance_date=today,
        check_in=datetime.now(timezone.utc),
        status="PRESENT",
        latitude=Decimal(str(payload.latitude)) if payload.latitude else None,
        longitude=Decimal(str(payload.longitude)) if payload.longitude else None,
        geofence_verified=payload.geofence_verified,
    )
    db.add(rec)
    await db.commit()
    return {"message": "Clocked in successfully", "status": "PRESENT", "check_in": rec.check_in.strftime("%I:%M %p")}


@router.get("/leaves")
async def list_leaves(
    employee_id: Optional[str] = None,
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List live leave requests from database with data scope filtering."""
    authorize(ctx, "leave", "view", module_slug="hr")
    emp = await get_or_create_employee(db, current_user)
    scope = await DataScopeService.get_resource_scope(db, current_user, "leave")

    stmt = (
        select(LeaveRequest, Employee, User)
        .join(Employee, Employee.id == LeaveRequest.employee_id)
        .outerjoin(User, User.id == Employee.user_id)
        .order_by(LeaveRequest.created_at.desc())
    )

    if current_user.organization_id:
        stmt = stmt.where(LeaveRequest.organization_id == current_user.organization_id)

    if scope == "SELF":
        stmt = stmt.where(LeaveRequest.employee_id == emp.id)
    elif employee_id:
        stmt = stmt.where(LeaveRequest.employee_id == employee_id)

    res = await db.execute(stmt)
    rows = res.all()

    return [
        {
            "id": str(r[0].id),
            "employee_id": str(r[0].employee_id),
            "employee_name": r[2].full_name if r[2] else (r[1].employee_code if r[1] else "Staff Member"),
            "leave_type": r[0].leave_type,
            "start_date": r[0].start_date.isoformat(),
            "end_date": r[0].end_date.isoformat(),
            "total_days": float(r[0].total_days),
            "reason": r[0].reason or "Personal Leave",
            "status": r[0].status,
            "created_at": r[0].created_at.isoformat() if r[0].created_at else None,
        }
        for r in rows
    ]


@router.post("/leaves", status_code=status.HTTP_201_CREATED)
async def submit_leave(
    payload: LeaveSubmitRequest,
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a live leave request into the database."""
    authorize(ctx, "leave", "create", module_slug="hr")
    emp = await get_or_create_employee(db, current_user)
    target_emp_id = payload.employee_id or emp.id

    leave = LeaveRequest(
        organization_id=current_user.organization_id or emp.organization_id,
        employee_id=target_emp_id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        total_days=Decimal(str(payload.total_days)),
        reason=payload.reason,
        status="PENDING",
    )
    db.add(leave)
    await db.commit()
    await db.refresh(leave)

    await audit_service.log_event(
        db=db,
        action="LEAVE_REQUESTED",
        organization_id=str(current_user.organization_id) if current_user.organization_id else "platform",
        actor_id=str(current_user.id),
        resource_type="leave_request",
        resource_id=str(leave.id),
        metadata={"leave_type": leave.leave_type, "total_days": float(leave.total_days)},
    )

    return {"id": str(leave.id), "status": "PENDING", "message": "Leave request submitted successfully"}


@router.put("/leaves/{leave_id}/status")
async def update_leave_status(
    leave_id: str,
    payload: LeaveActionRequest,
    ctx: RequestContext = Depends(get_request_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Approve or reject a live leave request."""
    authorize(ctx, "leave", "approve", module_slug="hr")

    leave = await db.get(LeaveRequest, leave_id)
    if not leave:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

    if current_user.organization_id and str(leave.organization_id) != str(current_user.organization_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to tenant leave request")

    leave.status = payload.status.upper()
    leave.approved_by = current_user.id
    leave.approved_at = datetime.now(timezone.utc)
    await db.commit()

    await audit_service.log_event(
        db=db,
        action=f"LEAVE_{payload.status.upper()}",
        organization_id=str(leave.organization_id),
        actor_id=str(current_user.id),
        resource_type="leave_request",
        resource_id=str(leave.id),
        metadata={"new_status": leave.status},
    )

    return {"id": str(leave.id), "status": leave.status, "message": f"Leave request marked as {leave.status}"}
