"""
SQLAlchemy Database Models
Defines the database schema for the Payroll Management System
"""

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Enum, ForeignKey, Text, Boolean, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.database import Base


# Enums
class PayType(str, enum.Enum):
    """Employee payment type"""
    HOURLY = "hourly"
    SALARY = "salary"


class EmployeeStatus(str, enum.Enum):
    """Employee status"""
    ACTIVE = "active"
    INACTIVE = "inactive"


class PaymentStatus(str, enum.Enum):
    """Payment status for pay runs"""
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"


# Models
class TaxDeductionProfile(Base):
    """
    Tax and Deduction Profiles
    Stores different tax and deduction configurations
    """
    __tablename__ = "tax_deduction_profiles"
    
    profile_id = Column(Integer, primary_key=True, index=True)
    profile_name = Column(String(100), nullable=False, unique=True)
    
    # Tax rates (as decimals, e.g., 0.22 for 22%)
    federal_tax_rate = Column(Numeric(5, 4), default=0.0, nullable=False)
    state_tax_rate = Column(Numeric(5, 4), default=0.0, nullable=False)
    local_tax_rate = Column(Numeric(5, 4), default=0.0, nullable=False)
    
    # Social Security and Medicare (FICA)
    social_security_rate = Column(Numeric(5, 4), default=0.062, nullable=False)
    medicare_rate = Column(Numeric(5, 4), default=0.0145, nullable=False)
    
    # Fixed deductions (monthly amounts)
    retirement_withholding = Column(Numeric(10, 2), default=0.0, nullable=False)
    health_insurance = Column(Numeric(10, 2), default=0.0, nullable=False)
    dental_insurance = Column(Numeric(10, 2), default=0.0, nullable=False)
    vision_insurance = Column(Numeric(10, 2), default=0.0, nullable=False)
    other_deductions = Column(Numeric(10, 2), default=0.0, nullable=False)
    
    # Metadata
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    employees = relationship("Employee", back_populates="tax_deduction_profile")


class Employee(Base):
    """
    Employees Table
    Stores all employee information and pay settings
    """
    __tablename__ = "employees"
    
    employee_id = Column(Integer, primary_key=True, index=True)
    
    # Personal Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    
    # Employment Information
    role = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(Enum(EmployeeStatus), default=EmployeeStatus.ACTIVE, nullable=False)
    
    # Pay Information
    pay_type = Column(Enum(PayType), nullable=False)
    hourly_rate = Column(Numeric(10, 2), nullable=True)  # For hourly employees
    salary_amount = Column(Numeric(12, 2), nullable=True)  # Annual salary
    overtime_rate = Column(Numeric(10, 2), nullable=True)  # Typically 1.5x hourly_rate
    pay_periods_per_year = Column(Integer, default=26, nullable=False)  # Biweekly default
    
    # Tax and Deduction Profile
    tax_deduction_profile_id = Column(Integer, ForeignKey("tax_deduction_profiles.profile_id"), nullable=True)
    
    # Banking Information (encrypted in production)
    bank_account = Column(String(50), nullable=True)
    routing_number = Column(String(20), nullable=True)
    
    # Metadata
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tax_deduction_profile = relationship("TaxDeductionProfile", back_populates="employees")
    work_hours = relationship("WorkHours", back_populates="employee", cascade="all, delete-orphan")
    pay_runs = relationship("PayRun", back_populates="employee", cascade="all, delete-orphan")


class WorkHours(Base):
    """
    Work Hours Table
    Tracks daily work hours for hourly employees
    """
    __tablename__ = "work_hours"
    
    record_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=False, index=True)
    
    # Time tracking
    date = Column(Date, nullable=False, index=True)
    hours_worked = Column(Numeric(5, 2), nullable=False, default=0.0)
    overtime_hours = Column(Numeric(5, 2), nullable=False, default=0.0)
    
    # Additional information
    notes = Column(Text, nullable=True)
    approved_by = Column(String(100), nullable=True)
    is_approved = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    employee = relationship("Employee", back_populates="work_hours")


class PayRun(Base):
    """
    Pay Runs Table
    Stores calculated payroll data for each pay period
    """
    __tablename__ = "pay_runs"
    
    pay_run_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=False, index=True)
    
    # Pay period
    start_period = Column(Date, nullable=False, index=True)
    end_period = Column(Date, nullable=False, index=True)
    pay_date = Column(Date, nullable=True)
    
    # Hours (for hourly employees)
    regular_hours = Column(Numeric(6, 2), default=0.0, nullable=False)
    overtime_hours = Column(Numeric(6, 2), default=0.0, nullable=False)
    
    # Pay calculations
    regular_pay = Column(Numeric(10, 2), default=0.0, nullable=False)
    overtime_pay = Column(Numeric(10, 2), default=0.0, nullable=False)
    bonuses = Column(Numeric(10, 2), default=0.0, nullable=False)
    gross_pay = Column(Numeric(10, 2), nullable=False)
    
    # Deductions
    federal_tax = Column(Numeric(10, 2), default=0.0, nullable=False)
    state_tax = Column(Numeric(10, 2), default=0.0, nullable=False)
    local_tax = Column(Numeric(10, 2), default=0.0, nullable=False)
    social_security = Column(Numeric(10, 2), default=0.0, nullable=False)
    medicare = Column(Numeric(10, 2), default=0.0, nullable=False)
    retirement = Column(Numeric(10, 2), default=0.0, nullable=False)
    insurance = Column(Numeric(10, 2), default=0.0, nullable=False)
    other_deductions = Column(Numeric(10, 2), default=0.0, nullable=False)
    
    total_taxes = Column(Numeric(10, 2), default=0.0, nullable=False)
    total_deductions = Column(Numeric(10, 2), default=0.0, nullable=False)
    
    # Final pay
    net_pay = Column(Numeric(10, 2), nullable=False)
    
    # Status
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    
    # Additional information
    notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    employee = relationship("Employee", back_populates="pay_runs")
