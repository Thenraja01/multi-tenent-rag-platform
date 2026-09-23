from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class EmployeeCreate(BaseModel):
    user_id: Optional[str] = None
    department_id: Optional[str] = None
    manager_id: Optional[str] = None
    employee_code: str = Field(..., min_length=2, max_length=100)
    job_title: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    joining_date: Optional[date] = None


class EmployeeResponse(BaseModel):
    id: str
    employee_code: str
    employment_status: str
    job_title: Optional[str] = None
    joining_date: Optional[date] = None

    class Config:
        from_attributes = True


class LeaveRequestCreate(BaseModel):
    leave_type: str = Field(..., pattern="^(CASUAL|SICK|ANNUAL|UNPAID)$")
    start_date: date
    end_date: date
    reason: Optional[str] = None


class LeaveApproval(BaseModel):
    action: str = Field(..., pattern="^(APPROVE|REJECT)$")
    rejection_reason: Optional[str] = None


class AttendanceCheckIn(BaseModel):
    check_in_notes: Optional[str] = None
