import sys
import os
from datetime import date, timedelta
from decimal import Decimal

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import Employee, WorkHours, PayRun, TaxDeductionProfile, PayType, EmployeeStatus, PaymentStatus
from app.services.payroll import PayrollCalculator

def seed_data():
    db = SessionLocal()
    try:
        print("Seeding data...")
        
        # 1. Create Tax Profile
        profile = db.query(TaxDeductionProfile).filter_by(profile_name="Standard US").first()
        if not profile:
            profile = TaxDeductionProfile(
                profile_name="Standard US",
                federal_tax_rate=0.12,
                state_tax_rate=0.05,
                local_tax_rate=0.01,
                social_security_rate=0.062,
                medicare_rate=0.0145,
                retirement_withholding=100.00,
                health_insurance=150.00,
                dental_insurance=20.00,
                vision_insurance=10.00
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
            print(f"Created Tax Profile: {profile.profile_name}")
        else:
            print(f"Tax Profile exists: {profile.profile_name}")

        # 2. Create Employee
        employee = db.query(Employee).filter_by(email="john.doe@example.com").first()
        if not employee:
            employee = Employee(
                first_name="John",
                last_name="Doe",
                email="john.doe@example.com",
                role="Software Engineer",
                start_date=date.today() - timedelta(days=365),
                status=EmployeeStatus.ACTIVE,
                pay_type=PayType.HOURLY,
                hourly_rate=50.00,
                overtime_rate=75.00,
                tax_deduction_profile_id=profile.profile_id
            )
            db.add(employee)
            db.commit()
            db.refresh(employee)
            print(f"Created Employee: {employee.first_name} {employee.last_name}")
        else:
            print(f"Employee exists: {employee.first_name}")

        # 3. Create Work Hours
        # Create hours for the last 2 weeks
        start_date = date.today() - timedelta(days=14)
        end_date = date.today()
        
        existing_hours = db.query(WorkHours).filter(
            WorkHours.employee_id == employee.employee_id,
            WorkHours.date >= start_date
        ).count()
        
        if existing_hours == 0:
            current = start_date
            while current <= end_date:
                if current.weekday() < 5: # Mon-Fri
                    hours = WorkHours(
                        employee_id=employee.employee_id,
                        date=current,
                        hours_worked=8.0,
                        overtime_hours=1.0 if current.weekday() == 4 else 0.0, # 1hr overtime on Fridays
                        is_approved=True,
                        approved_by="Admin"
                    )
                    db.add(hours)
                current += timedelta(days=1)
            db.commit()
            print("Created Work Hours")
        else:
            print("Work Hours exist")

        # 4. Create Pay Run
        # Check if pay run exists for this period
        existing_pay_run = db.query(PayRun).filter(
            PayRun.employee_id == employee.employee_id,
            PayRun.start_period == start_date
        ).first()
        
        if not existing_pay_run:
            calculator = PayrollCalculator(db)
            pay_run = calculator.create_pay_run(
                employee_id=employee.employee_id,
                start_period=start_date,
                end_period=end_date,
                pay_date=date.today(),
                bonuses=Decimal("500.00"),
                notes="Test Pay Run"
            )
            print(f"Created Pay Run #{pay_run.pay_run_id}")
        else:
            print(f"Pay Run exists #{existing_pay_run.pay_run_id}")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
