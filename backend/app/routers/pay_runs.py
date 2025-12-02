"""
Pay Runs API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
from app.models import PayRun, PaymentStatus
from app.schemas import (
    PayRun as PayRunSchema,
    PayRunCreate,
    PayRunUpdate,
    PayRunSummary,
    BulkPaymentUpdate
)
from app.services.payroll import PayrollCalculator

router = APIRouter()


@router.get("/", response_model=List[PayRunSchema])
def get_pay_runs(
    employee_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    payment_status: PaymentStatus | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get pay runs with optional filters
    
    - **employee_id**: Filter by specific employee
    - **start_date**: Filter pay runs starting from this date
    - **end_date**: Filter pay runs up to this date
    - **payment_status**: Filter by payment status
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    query = db.query(PayRun)
    
    if employee_id:
        query = query.filter(PayRun.employee_id == employee_id)
    if start_date:
        query = query.filter(PayRun.start_period >= start_date)
    if end_date:
        query = query.filter(PayRun.end_period <= end_date)
    if payment_status:
        query = query.filter(PayRun.payment_status == payment_status)
    
    pay_runs = query.order_by(PayRun.start_period.desc()).offset(skip).limit(limit).all()
    return pay_runs


@router.get("/{pay_run_id}", response_model=PayRunSchema)
def get_pay_run(pay_run_id: int, db: Session = Depends(get_db)):
    """
    Get a specific pay run by ID
    
    - **pay_run_id**: The pay run's unique identifier
    """
    pay_run = db.query(PayRun).filter(PayRun.pay_run_id == pay_run_id).first()
    
    if not pay_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run with ID {pay_run_id} not found"
        )
    
    return pay_run


@router.post("/", response_model=PayRunSchema, status_code=status.HTTP_201_CREATED)
def create_pay_run(pay_run_data: PayRunCreate, db: Session = Depends(get_db)):
    """
    Create a new pay run with automatic calculations
    
    This endpoint automatically calculates:
    - Hours worked (for hourly employees)
    - Gross pay
    - Taxes (federal, state, local, FICA)
    - Deductions (retirement, insurance, etc.)
    - Net pay
    
    You only need to provide:
    - employee_id
    - start_period
    - end_period
    - bonuses (optional)
    """
    calculator = PayrollCalculator(db)
    
    try:
        pay_run = calculator.create_pay_run(
            employee_id=pay_run_data.employee_id,
            start_period=pay_run_data.start_period,
            end_period=pay_run_data.end_period,
            pay_date=pay_run_data.pay_date,
            bonuses=pay_run_data.bonuses,
            notes=pay_run_data.notes
        )
        return pay_run
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{pay_run_id}", response_model=PayRunSchema)
def update_pay_run(
    pay_run_id: int,
    pay_run_update: PayRunUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing pay run
    
    - **pay_run_id**: The pay run's unique identifier
    - Only provided fields will be updated
    - Calculations are NOT re-run automatically
    """
    db_pay_run = db.query(PayRun).filter(PayRun.pay_run_id == pay_run_id).first()
    
    if not db_pay_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run with ID {pay_run_id} not found"
        )
    
    # Update only provided fields
    update_data = pay_run_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_pay_run, field, value)
    
    db.commit()
    db.refresh(db_pay_run)
    
    return db_pay_run


@router.delete("/{pay_run_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pay_run(pay_run_id: int, db: Session = Depends(get_db)):
    """
    Delete a pay run
    
    - **pay_run_id**: The pay run's unique identifier
    - Can only delete pay runs with PENDING or CANCELLED status
    """
    db_pay_run = db.query(PayRun).filter(PayRun.pay_run_id == pay_run_id).first()
    
    if not db_pay_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run with ID {pay_run_id} not found"
        )
    
    if db_pay_run.payment_status == PaymentStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a pay run that has already been paid"
        )
    
    db.delete(db_pay_run)
    db.commit()
    
    return None


@router.post("/{pay_run_id}/recalculate", response_model=PayRunSchema)
def recalculate_pay_run(pay_run_id: int, db: Session = Depends(get_db)):
    """
    Recalculate an existing pay run
    
    - **pay_run_id**: The pay run's unique identifier
    - Fetches fresh work hours and recalculates all values
    """
    db_pay_run = db.query(PayRun).filter(PayRun.pay_run_id == pay_run_id).first()
    
    if not db_pay_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pay run with ID {pay_run_id} not found"
        )
    
    if db_pay_run.payment_status == PaymentStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot recalculate a pay run that has already been paid"
        )
    
    calculator = PayrollCalculator(db)
    
    try:
        # Calculate fresh values
        calc = calculator.calculate_pay_run(
            employee_id=db_pay_run.employee_id,
            start_period=db_pay_run.start_period,
            end_period=db_pay_run.end_period,
            bonuses=db_pay_run.bonuses
        )
        
        # Update pay run with new calculations
        for field, value in calc.items():
            setattr(db_pay_run, field, value)
        
        db.commit()
        db.refresh(db_pay_run)
        
        return db_pay_run
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/approve", response_model=List[PayRunSchema])
def approve_pay_runs(bulk_update: BulkPaymentUpdate, db: Session = Depends(get_db)):
    """
    Approve and mark multiple pay runs as paid
    
    - **pay_run_ids**: List of pay run IDs to approve
    - Sets payment_status to PAID and records processed_at timestamp
    """
    calculator = PayrollCalculator(db)
    
    try:
        pay_runs = calculator.approve_pay_runs(bulk_update.pay_run_ids)
        return pay_runs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/summary/dashboard")
def get_payroll_dashboard(
    start_period: date = Query(...),
    end_period: date = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get payroll summary dashboard data
    
    Returns summary of all pending pay runs for the specified period:
    - Total number of employees
    - Total gross pay
    - Total taxes
    - Total deductions
    - Total net pay
    - List of all pay runs
    
    - **start_period**: Start date of the period
    - **end_period**: End date of the period
    """
    calculator = PayrollCalculator(db)
    summary = calculator.get_payroll_summary(start_period, end_period)
    
    # Convert pay_runs to summary format
    from app.models import Employee
    
    pay_run_summaries = []
    for pr in summary['pay_runs']:
        employee = db.query(Employee).filter(Employee.employee_id == pr.employee_id).first()
        pay_run_summaries.append({
            "pay_run_id": pr.pay_run_id,
            "employee_id": pr.employee_id,
            "employee_name": f"{employee.first_name} {employee.last_name}" if employee else "Unknown",
            "start_period": pr.start_period,
            "end_period": pr.end_period,
            "gross_pay": pr.gross_pay,
            "total_taxes": pr.total_taxes,
            "total_deductions": pr.total_deductions,
            "net_pay": pr.net_pay,
            "payment_status": pr.payment_status
        })
    
    return {
        "summary": {
            "employee_count": summary['employee_count'],
            "total_gross_pay": float(summary['total_gross_pay']),
            "total_taxes": float(summary['total_taxes']),
            "total_deductions": float(summary['total_deductions']),
            "total_net_pay": float(summary['total_net_pay'])
        },
        "pay_runs": pay_run_summaries
    }
