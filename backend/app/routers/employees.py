"""
Employee Management API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Employee, EmployeeStatus
from app.schemas import Employee as EmployeeSchema, EmployeeCreate, EmployeeUpdate, EmployeeSummary

router = APIRouter()


@router.get("/", response_model=List[EmployeeSummary])
def get_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: EmployeeStatus | None = None,
    db: Session = Depends(get_db)
):
    """
    Get list of all employees with pagination
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **status**: Filter by employee status (active/inactive)
    """
    query = db.query(Employee)
    
    if status:
        query = query.filter(Employee.status == status)
    
    employees = query.offset(skip).limit(limit).all()
    return employees


@router.get("/{employee_id}", response_model=EmployeeSchema)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    """
    Get a specific employee by ID
    
    - **employee_id**: The employee's unique identifier
    """
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found"
        )
    
    return employee


@router.post("/", response_model=EmployeeSchema, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    """
    Create a new employee
    
    Validates that:
    - Email is unique
    - Hourly rate is provided for hourly employees
    - Salary amount is provided for salary employees
    """
    # Check if email already exists
    existing = db.query(Employee).filter(Employee.email == employee.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee with email {employee.email} already exists"
        )
    
    # Create new employee
    db_employee = Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    
    return db_employee


@router.put("/{employee_id}", response_model=EmployeeSchema)
def update_employee(
    employee_id: int,
    employee_update: EmployeeUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing employee
    
    - **employee_id**: The employee's unique identifier
    - Only provided fields will be updated
    """
    db_employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    
    if not db_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found"
        )
    
    # Update only provided fields
    update_data = employee_update.model_dump(exclude_unset=True)
    
    # Check email uniqueness if being updated
    if "email" in update_data:
        existing = db.query(Employee).filter(
            Employee.email == update_data["email"],
            Employee.employee_id != employee_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Employee with email {update_data['email']} already exists"
            )
    
    for field, value in update_data.items():
        setattr(db_employee, field, value)
    
    db.commit()
    db.refresh(db_employee)
    
    return db_employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """
    Delete an employee (soft delete by setting status to inactive)
    
    - **employee_id**: The employee's unique identifier
    """
    db_employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    
    if not db_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found"
        )
    
    # Soft delete by setting status to inactive
    db_employee.status = EmployeeStatus.INACTIVE
    db.commit()
    
    return None


@router.get("/{employee_id}/summary")
def get_employee_summary(employee_id: int, db: Session = Depends(get_db)):
    """
    Get employee summary including recent pay runs and work hours
    
    - **employee_id**: The employee's unique identifier
    """
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found"
        )
    
    # Get recent pay runs (last 5)
    from app.models import PayRun
    recent_pay_runs = db.query(PayRun).filter(
        PayRun.employee_id == employee_id
    ).order_by(PayRun.start_period.desc()).limit(5).all()
    
    # Get recent work hours (last 30 days) if hourly employee
    from app.models import WorkHours, PayType
    from datetime import date, timedelta
    
    recent_hours = []
    if employee.pay_type == PayType.HOURLY:
        thirty_days_ago = date.today() - timedelta(days=30)
        recent_hours = db.query(WorkHours).filter(
            WorkHours.employee_id == employee_id,
            WorkHours.date >= thirty_days_ago
        ).order_by(WorkHours.date.desc()).all()
    
    return {
        "employee": employee,
        "recent_pay_runs": recent_pay_runs,
        "recent_work_hours": recent_hours
    }
