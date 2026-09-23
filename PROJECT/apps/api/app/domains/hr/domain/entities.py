from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional, Dict, Any


@dataclass
class EmployeeEntity:
    id: str
    organization_id: str
    employee_code: str
    employment_status: str
    user_id: Optional[str] = None
    department_id: Optional[str] = None
    manager_id: Optional[str] = None
    joining_date: Optional[date] = None
    leaving_date: Optional[date] = None


@dataclass
class LeaveRequestEntity:
    id: str
    organization_id: str
    employee_id: str
    leave_type: str
    start_date: date
    end_date: date
    days_count: float
    status: str
    reason: Optional[str] = None
