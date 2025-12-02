"""
Work Hours Tracking API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
from app.models import WorkHours, Employee
from app.schemas import WorkHours as WorkHoursSchema, WorkHoursCreate, WorkHoursUpdate

router = APIRouter()


@router.get("/", response_model=List[WorkHoursSchema])
def get_work_hours(
    employee_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    approved: bool | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get work hours records with optional filters
    
    - **employee_id**: Filter by specific employee
    - **start_date**: Filter records from this date onwards
    - **end_date**: Filter records up to this date
    - **approved**: Filter by approval status
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    query = db.query(WorkHours)
    
    if employee_id:
        query = query.filter(WorkHours.employee_id == employee_id)
    if start_date:
        query = query.filter(WorkHours.date >= start_date)
    if end_date:
        query = query.filter(WorkHours.date <= end_date)
    if approved is not None:
        query = query.filter(WorkHours.is_approved == approved)
    
    work_hours = query.order_by(WorkHours.date.desc()).offset(skip).limit(limit).all()
    return work_hours


@router.get("/{record_id}/", response_model=WorkHoursSchema)
def get_work_hour(record_id: int, db: Session = Depends(get_db)):
    """
    Get a specific work hours record by ID
    
    - **record_id**: The work hours record's unique identifier
    """
    work_hour = db.query(WorkHours).filter(WorkHours.record_id == record_id).first()
    
    if not work_hour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work hours record with ID {record_id} not found"
        )
    
    return work_hour


@router.post("/", response_model=WorkHoursSchema, status_code=status.HTTP_201_CREATED)
def create_work_hours(work_hours: WorkHoursCreate, db: Session = Depends(get_db)):
    """
    Create a new work hours record
    
    Validates that:
    - Employee exists
    - Hours worked + overtime hours don't exceed 24 hours
    """
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.employee_id == work_hours.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {work_hours.employee_id} not found"
        )
    
    # Check if record for this employee and date already exists
    existing = db.query(WorkHours).filter(
        WorkHours.employee_id == work_hours.employee_id,
        WorkHours.date == work_hours.date
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Work hours record for employee {work_hours.employee_id} on {work_hours.date} already exists"
        )
    
    # Create new work hours record
    db_work_hours = WorkHours(**work_hours.model_dump())
    db.add(db_work_hours)
    db.commit()
    db.refresh(db_work_hours)
    
    return db_work_hours


@router.put("/{record_id}/", response_model=WorkHoursSchema)
def update_work_hours(
    record_id: int,
    work_hours_update: WorkHoursUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing work hours record
    
    - **record_id**: The work hours record's unique identifier
    - Only provided fields will be updated
    """
    db_work_hours = db.query(WorkHours).filter(WorkHours.record_id == record_id).first()
    
    if not db_work_hours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work hours record with ID {record_id} not found"
        )
    
    # Update only provided fields
    update_data = work_hours_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_work_hours, field, value)
    
    db.commit()
    db.refresh(db_work_hours)
    
    return db_work_hours


@router.delete("/{record_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_work_hours(record_id: int, db: Session = Depends(get_db)):
    """
    Delete a work hours record
    
    - **record_id**: The work hours record's unique identifier
    """
    db_work_hours = db.query(WorkHours).filter(WorkHours.record_id == record_id).first()
    
    if not db_work_hours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work hours record with ID {record_id} not found"
        )
    
    db.delete(db_work_hours)
    db.commit()
    
    return None


@router.post("/{record_id}/approve/", response_model=WorkHoursSchema)
def approve_work_hours(
    record_id: int,
    approved_by: str,
    db: Session = Depends(get_db)
):
    """
    Approve a work hours record
    
    - **record_id**: The work hours record's unique identifier
    - **approved_by**: Name of person approving
    """
    db_work_hours = db.query(WorkHours).filter(WorkHours.record_id == record_id).first()
    
    if not db_work_hours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work hours record with ID {record_id} not found"
        )
    
    db_work_hours.is_approved = True
    db_work_hours.approved_by = approved_by
    
    db.commit()
    db.refresh(db_work_hours)
    
    return db_work_hours


@router.post("/bulk-approve/")
def bulk_approve_work_hours(
    record_ids: List[int],
    approved_by: str,
    db: Session = Depends(get_db)
):
    """
    Approve multiple work hours records at once
    
    - **record_ids**: List of work hours record IDs to approve
    - **approved_by**: Name of person approving
    """
    work_hours = db.query(WorkHours).filter(WorkHours.record_id.in_(record_ids)).all()
    
    if not work_hours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No work hours records found with provided IDs"
        )
    
    for wh in work_hours:
        wh.is_approved = True
        wh.approved_by = approved_by
    
    db.commit()
    
    return {
        "approved_count": len(work_hours),
        "record_ids": [wh.record_id for wh in work_hours]
    }
