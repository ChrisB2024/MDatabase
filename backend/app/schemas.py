"""
Pydantic Schemas for Request/Response Validation
"""

from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


# Enums (matching database models)
from enum import Enum


class PayTypeEnum(str, Enum):
    HOURLY = "hourly"
    SALARY = "salary"


class EmployeeStatusEnum(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class PaymentStatusEnum(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"


# ==================== Tax Deduction Profile Schemas ====================

class TaxDeductionProfileBase(BaseModel):
    profile_name: str = Field(..., max_length=100)
    federal_tax_rate: Decimal = Field(default=Decimal("0.0"), ge=0, le=1)
    state_tax_rate: Decimal = Field(default=Decimal("0.0"), ge=0, le=1)
    local_tax_rate: Decimal = Field(default=Decimal("0.0"), ge=0, le=1)
    social_security_rate: Decimal = Field(default=Decimal("0.062"), ge=0, le=1)
    medicare_rate: Decimal = Field(default=Decimal("0.0145"), ge=0, le=1)
    retirement_withholding: Decimal = Field(default=Decimal("0.0"), ge=0)
    health_insurance: Decimal = Field(default=Decimal("0.0"), ge=0)
    dental_insurance: Decimal = Field(default=Decimal("0.0"), ge=0)
    vision_insurance: Decimal = Field(default=Decimal("0.0"), ge=0)
    other_deductions: Decimal = Field(default=Decimal("0.0"), ge=0)
    description: Optional[str] = None


class TaxDeductionProfileCreate(TaxDeductionProfileBase):
    pass


class TaxDeductionProfileUpdate(BaseModel):
    profile_name: Optional[str] = Field(None, max_length=100)
    federal_tax_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    state_tax_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    local_tax_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    social_security_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    medicare_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    retirement_withholding: Optional[Decimal] = Field(None, ge=0)
    health_insurance: Optional[Decimal] = Field(None, ge=0)
    dental_insurance: Optional[Decimal] = Field(None, ge=0)
    vision_insurance: Optional[Decimal] = Field(None, ge=0)
    other_deductions: Optional[Decimal] = Field(None, ge=0)
    description: Optional[str] = None


class TaxDeductionProfile(TaxDeductionProfileBase):
    profile_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== Employee Schemas ====================

class EmployeeBase(BaseModel):
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    role: str = Field(..., max_length=100)
    start_date: date
    end_date: Optional[date] = None
    status: EmployeeStatusEnum = EmployeeStatusEnum.ACTIVE
    pay_type: PayTypeEnum
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    salary_amount: Optional[Decimal] = Field(None, ge=0)
    overtime_rate: Optional[Decimal] = Field(None, ge=0)
    pay_periods_per_year: int = Field(default=26, ge=1, le=365)
    tax_deduction_profile_id: Optional[int] = None
    bank_account: Optional[str] = Field(None, max_length=50)
    routing_number: Optional[str] = Field(None, max_length=20)
    notes: Optional[str] = None

    @validator('hourly_rate')
    def validate_hourly_rate(cls, v, values):
        if 'pay_type' in values and values['pay_type'] == PayTypeEnum.HOURLY and not v:
            raise ValueError('hourly_rate is required for hourly employees')
        return v

    @validator('salary_amount')
    def validate_salary_amount(cls, v, values):
        if 'pay_type' in values and values['pay_type'] == PayTypeEnum.SALARY and not v:
            raise ValueError('salary_amount is required for salary employees')
        return v


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    role: Optional[str] = Field(None, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[EmployeeStatusEnum] = None
    pay_type: Optional[PayTypeEnum] = None
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    salary_amount: Optional[Decimal] = Field(None, ge=0)
    overtime_rate: Optional[Decimal] = Field(None, ge=0)
    pay_periods_per_year: Optional[int] = Field(None, ge=1, le=365)
    tax_deduction_profile_id: Optional[int] = None
    bank_account: Optional[str] = Field(None, max_length=50)
    routing_number: Optional[str] = Field(None, max_length=20)
    notes: Optional[str] = None


class Employee(EmployeeBase):
    employee_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== Work Hours Schemas ====================

class WorkHoursBase(BaseModel):
    employee_id: int
    date: date
    hours_worked: Decimal = Field(..., ge=0, le=24)
    overtime_hours: Decimal = Field(default=Decimal("0.0"), ge=0, le=24)
    notes: Optional[str] = None
    approved_by: Optional[str] = Field(None, max_length=100)
    is_approved: bool = False


class WorkHoursCreate(WorkHoursBase):
    pass


class WorkHoursUpdate(BaseModel):
    date: Optional[date] = None
    hours_worked: Optional[Decimal] = Field(None, ge=0, le=24)
    overtime_hours: Optional[Decimal] = Field(None, ge=0, le=24)
    notes: Optional[str] = None
    approved_by: Optional[str] = Field(None, max_length=100)
    is_approved: Optional[bool] = None


class WorkHours(WorkHoursBase):
    record_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== Pay Run Schemas ====================

class PayRunBase(BaseModel):
    employee_id: int
    start_period: date
    end_period: date
    pay_date: Optional[date] = None
    regular_hours: Decimal = Field(default=Decimal("0.0"), ge=0)
    overtime_hours: Decimal = Field(default=Decimal("0.0"), ge=0)
    regular_pay: Decimal = Field(default=Decimal("0.0"), ge=0)
    overtime_pay: Decimal = Field(default=Decimal("0.0"), ge=0)
    bonuses: Decimal = Field(default=Decimal("0.0"), ge=0)
    gross_pay: Decimal = Field(..., ge=0)
    federal_tax: Decimal = Field(default=Decimal("0.0"), ge=0)
    state_tax: Decimal = Field(default=Decimal("0.0"), ge=0)
    local_tax: Decimal = Field(default=Decimal("0.0"), ge=0)
    social_security: Decimal = Field(default=Decimal("0.0"), ge=0)
    medicare: Decimal = Field(default=Decimal("0.0"), ge=0)
    retirement: Decimal = Field(default=Decimal("0.0"), ge=0)
    insurance: Decimal = Field(default=Decimal("0.0"), ge=0)
    other_deductions: Decimal = Field(default=Decimal("0.0"), ge=0)
    total_taxes: Decimal = Field(default=Decimal("0.0"), ge=0)
    total_deductions: Decimal = Field(default=Decimal("0.0"), ge=0)
    net_pay: Decimal = Field(..., ge=0)
    payment_status: PaymentStatusEnum = PaymentStatusEnum.PENDING
    notes: Optional[str] = None


class PayRunCreate(BaseModel):
    """Simplified schema for creating a pay run - calculations will be done server-side"""
    employee_id: int
    start_period: date
    end_period: date
    pay_date: Optional[date] = None
    bonuses: Decimal = Field(default=Decimal("0.0"), ge=0)
    notes: Optional[str] = None


class PayRunUpdate(BaseModel):
    pay_date: Optional[date] = None
    bonuses: Optional[Decimal] = Field(None, ge=0)
    payment_status: Optional[PaymentStatusEnum] = None
    notes: Optional[str] = None


class PayRun(PayRunBase):
    pay_run_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== Summary Schemas ====================

class EmployeeSummary(BaseModel):
    """Lightweight employee info for lists"""
    employee_id: int
    first_name: str
    last_name: str
    email: str
    role: str
    status: EmployeeStatusEnum
    pay_type: PayTypeEnum

    model_config = ConfigDict(from_attributes=True)


class PayRunSummary(BaseModel):
    """Summary for payroll dashboard"""
    pay_run_id: int
    employee_id: int
    employee_name: str
    start_period: date
    end_period: date
    gross_pay: Decimal
    total_taxes: Decimal
    total_deductions: Decimal
    net_pay: Decimal
    payment_status: PaymentStatusEnum

    model_config = ConfigDict(from_attributes=True)


# ==================== Bulk Operations ====================

class BulkPaymentUpdate(BaseModel):
    """Update multiple pay runs at once"""
    pay_run_ids: list[int] = Field(..., min_length=1)
    payment_status: PaymentStatusEnum
    processed_at: Optional[datetime] = None
