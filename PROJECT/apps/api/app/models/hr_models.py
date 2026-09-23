import uuid
from datetime import datetime, date, timezone
from typing import Optional, List
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Date,
    Numeric,
    DateTime,
    ForeignKey,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base


class Employee(Base):
    __tablename__ = "employees"
    __table_args__ = (
        UniqueConstraint("organization_id", "employee_code", name="uq_emp_org_code"),
        {"extend_existing": True},
    )

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, unique=True, index=True)
    department_id = Column(UUID(as_uuid=False), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    manager_id = Column(UUID(as_uuid=False), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_code = Column(String(100), nullable=False, index=True)
    employment_status = Column(String(50), nullable=False, default="ACTIVE", index=True)
    joining_date = Column(Date, nullable=True)
    leaving_date = Column(Date, nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="employees")
    user = relationship("User", back_populates="employee")
    department = relationship("Department", back_populates="employees")
    manager = relationship("Employee", remote_side="Employee.id")
    profile = relationship("EmployeeProfile", back_populates="employee", uselist=False, cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="employee", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", back_populates="employee", foreign_keys="LeaveRequest.employee_id", cascade="all, delete-orphan")


class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"
    __table_args__ = {"extend_existing": True}

    employee_id = Column(UUID(as_uuid=False), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    job_title = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(200), nullable=True)
    metadata_json = Column("metadata", JSON().with_variant(JSONB, "postgresql"), default=dict)

    employee = relationship("Employee", back_populates="profile")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    __table_args__ = (
        UniqueConstraint("employee_id", "attendance_date", name="uq_attendance_emp_date"),
        {"extend_existing": True},
    )

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(UUID(as_uuid=False), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    attendance_date = Column(Date, nullable=False, index=True)
    check_in = Column(DateTime(timezone=True), nullable=True)
    check_out = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="PRESENT", index=True)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    geofence_verified = Column(Boolean, nullable=False, default=False)

    employee = relationship("Employee", back_populates="attendance_records")


class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    __table_args__ = {"extend_existing": True}

    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(UUID(as_uuid=False), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    leave_type = Column(String(100), nullable=False, index=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_days = Column(Numeric(5, 2), nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="PENDING", index=True)  # PENDING, APPROVED, REJECTED, CANCELLED
    approved_by = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    employee = relationship("Employee", back_populates="leave_requests", foreign_keys=[employee_id])
    approver = relationship("User", foreign_keys=[approved_by])
