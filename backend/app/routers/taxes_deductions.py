"""
Tax and Deduction Profiles API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import TaxDeductionProfile
from app.schemas import (
    TaxDeductionProfile as TaxDeductionProfileSchema,
    TaxDeductionProfileCreate,
    TaxDeductionProfileUpdate
)

router = APIRouter()


@router.get("/", response_model=List[TaxDeductionProfileSchema])
def get_tax_profiles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get list of all tax and deduction profiles
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    profiles = db.query(TaxDeductionProfile).offset(skip).limit(limit).all()
    return profiles


@router.get("/{profile_id}/", response_model=TaxDeductionProfileSchema)
def get_tax_profile(profile_id: int, db: Session = Depends(get_db)):
    """
    Get a specific tax/deduction profile by ID
    
    - **profile_id**: The profile's unique identifier
    """
    profile = db.query(TaxDeductionProfile).filter(
        TaxDeductionProfile.profile_id == profile_id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tax/Deduction profile with ID {profile_id} not found"
        )
    
    return profile


@router.post("/", response_model=TaxDeductionProfileSchema, status_code=status.HTTP_201_CREATED)
def create_tax_profile(
    profile: TaxDeductionProfileCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new tax and deduction profile
    
    Validates that:
    - Profile name is unique
    - All rates are between 0 and 1
    """
    # Check if profile name already exists
    existing = db.query(TaxDeductionProfile).filter(
        TaxDeductionProfile.profile_name == profile.profile_name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Profile with name '{profile.profile_name}' already exists"
        )
    
    # Create new profile
    db_profile = TaxDeductionProfile(**profile.model_dump())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    
    return db_profile


@router.put("/{profile_id}/", response_model=TaxDeductionProfileSchema)
def update_tax_profile(
    profile_id: int,
    profile_update: TaxDeductionProfileUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing tax/deduction profile
    
    - **profile_id**: The profile's unique identifier
    - Only provided fields will be updated
    """
    db_profile = db.query(TaxDeductionProfile).filter(
        TaxDeductionProfile.profile_id == profile_id
    ).first()
    
    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tax/Deduction profile with ID {profile_id} not found"
        )
    
    # Update only provided fields
    update_data = profile_update.model_dump(exclude_unset=True)
    
    # Check name uniqueness if being updated
    if "profile_name" in update_data:
        existing = db.query(TaxDeductionProfile).filter(
            TaxDeductionProfile.profile_name == update_data["profile_name"],
            TaxDeductionProfile.profile_id != profile_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Profile with name '{update_data['profile_name']}' already exists"
            )
    
    for field, value in update_data.items():
        setattr(db_profile, field, value)
    
    db.commit()
    db.refresh(db_profile)
    
    return db_profile


@router.delete("/{profile_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_tax_profile(profile_id: int, db: Session = Depends(get_db)):
    """
    Delete a tax/deduction profile
    
    - **profile_id**: The profile's unique identifier
    - Cannot delete if profile is assigned to any employees
    """
    db_profile = db.query(TaxDeductionProfile).filter(
        TaxDeductionProfile.profile_id == profile_id
    ).first()
    
    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tax/Deduction profile with ID {profile_id} not found"
        )
    
    # Check if profile is assigned to any employees
    from app.models import Employee
    assigned_employees = db.query(Employee).filter(
        Employee.tax_deduction_profile_id == profile_id
    ).count()
    
    if assigned_employees > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete profile. It is assigned to {assigned_employees} employee(s)"
        )
    
    db.delete(db_profile)
    db.commit()
    
    return None
