"""
Payroll Calculation Services
Core business logic for calculating employee pay, taxes, and deductions
"""

from decimal import Decimal
from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models import Employee, WorkHours, PayRun, TaxDeductionProfile, PayType, PaymentStatus
from app.schemas import PayRunCreate


class PayrollCalculator:
    """
    Handles all payroll calculations for both hourly and salary employees
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_pay_run(
        self,
        employee_id: int,
        start_period: date,
        end_period: date,
        bonuses: Decimal = Decimal("0.0")
    ) -> dict:
        """
        Calculate complete pay run for an employee for a given period.
        
        Args:
            employee_id: The employee's ID
            start_period: Start date of the pay period
            end_period: End date of the pay period
            bonuses: Any additional bonuses to add
            
        Returns:
            Dictionary with all calculated pay components
        """
        # Get employee
        employee = self.db.query(Employee).filter(Employee.employee_id == employee_id).first()
        if not employee:
            raise ValueError(f"Employee {employee_id} not found")
        
        # Get tax profile
        tax_profile = None
        if employee.tax_deduction_profile_id:
            tax_profile = self.db.query(TaxDeductionProfile).filter(
                TaxDeductionProfile.profile_id == employee.tax_deduction_profile_id
            ).first()
        
        # Calculate based on pay type
        if employee.pay_type == PayType.HOURLY:
            return self._calculate_hourly_pay(employee, start_period, end_period, bonuses, tax_profile)
        else:
            return self._calculate_salary_pay(employee, start_period, end_period, bonuses, tax_profile)
    
    def _calculate_hourly_pay(
        self,
        employee: Employee,
        start_period: date,
        end_period: date,
        bonuses: Decimal,
        tax_profile: TaxDeductionProfile | None
    ) -> dict:
        """Calculate pay for hourly employees"""
        
        # Get work hours for the period
        work_hours = self.db.query(WorkHours).filter(
            and_(
                WorkHours.employee_id == employee.employee_id,
                WorkHours.date >= start_period,
                WorkHours.date <= end_period,
                WorkHours.is_approved == True
            )
        ).all()
        
        # Sum up hours
        regular_hours = sum(Decimal(str(wh.hours_worked)) for wh in work_hours)
        overtime_hours = sum(Decimal(str(wh.overtime_hours)) for wh in work_hours)
        
        # Calculate pay
        hourly_rate = Decimal(str(employee.hourly_rate or 0))
        overtime_rate = Decimal(str(employee.overtime_rate or (hourly_rate * Decimal("1.5"))))
        
        regular_pay = regular_hours * hourly_rate
        overtime_pay = overtime_hours * overtime_rate
        gross_pay = regular_pay + overtime_pay + bonuses
        
        # Calculate taxes and deductions
        tax_deduct = self._calculate_taxes_and_deductions(gross_pay, tax_profile)
        
        net_pay = gross_pay - tax_deduct['total_taxes'] - tax_deduct['total_deductions']
        
        return {
            'regular_hours': regular_hours,
            'overtime_hours': overtime_hours,
            'regular_pay': regular_pay,
            'overtime_pay': overtime_pay,
            'bonuses': bonuses,
            'gross_pay': gross_pay,
            'net_pay': net_pay,
            **tax_deduct
        }
    
    def _calculate_salary_pay(
        self,
        employee: Employee,
        start_period: date,
        end_period: date,
        bonuses: Decimal,
        tax_profile: TaxDeductionProfile | None
    ) -> dict:
        """Calculate pay for salary employees"""
        
        # Calculate gross pay based on pay periods per year
        salary_amount = Decimal(str(employee.salary_amount or 0))
        pay_periods_per_year = employee.pay_periods_per_year or 26
        
        regular_pay = salary_amount / Decimal(str(pay_periods_per_year))
        gross_pay = regular_pay + bonuses
        
        # Calculate taxes and deductions
        tax_deduct = self._calculate_taxes_and_deductions(gross_pay, tax_profile)
        
        net_pay = gross_pay - tax_deduct['total_taxes'] - tax_deduct['total_deductions']
        
        return {
            'regular_hours': Decimal("0.0"),
            'overtime_hours': Decimal("0.0"),
            'regular_pay': regular_pay,
            'overtime_pay': Decimal("0.0"),
            'bonuses': bonuses,
            'gross_pay': gross_pay,
            'net_pay': net_pay,
            **tax_deduct
        }
    
    def _calculate_nigerian_pit(self, annual_income: Decimal) -> Decimal:
        """
        Calculate Nigerian Personal Income Tax (PIT) using progressive brackets
        
        Tax Brackets (annual):
        - ₦0 - ₦300,000: 7%
        - ₦300,000 - ₦600,000: 11%
        - ₦600,000 - ₦1,100,000: 15%
        - ₦1,100,000 - ₦1,600,000: 19%
        - ₦1,600,000 - ₦3,200,000: 21%
        - Above ₦3,200,000: 24%
        
        Args:
            annual_income: Annual taxable income in Naira
            
        Returns:
            Annual PIT amount
        """
        if annual_income <= 0:
            return Decimal("0.0")
        
        # Define tax brackets (amounts in Naira)
        brackets = [
            (Decimal("300000"), Decimal("0.07")),    # First ₦300K at 7%
            (Decimal("600000"), Decimal("0.11")),    # Next ₦300K at 11%
            (Decimal("1100000"), Decimal("0.15")),   # Next ₦500K at 15%
            (Decimal("1600000"), Decimal("0.19")),   # Next ₦500K at 19%
            (Decimal("3200000"), Decimal("0.21")),   # Next ₦1.6M at 21%
            (None, Decimal("0.24"))                   # Remaining at 24%
        ]
        
        tax = Decimal("0.0")
        previous_limit = Decimal("0.0")
        
        for limit, rate in brackets:
            if limit is None:
                # Last bracket - all remaining income
                taxable_in_bracket = annual_income - previous_limit
                tax += taxable_in_bracket * rate
                break
            elif annual_income > limit:
                # Income exceeds this bracket - tax the full bracket
                taxable_in_bracket = limit - previous_limit
                tax += taxable_in_bracket * rate
                previous_limit = limit
            else:
                # Income falls within this bracket
                taxable_in_bracket = annual_income - previous_limit
                tax += taxable_in_bracket * rate
                break
        
        return tax
    
    def _calculate_taxes_and_deductions(
        self,
        gross_pay: Decimal,
        tax_profile: TaxDeductionProfile | None
    ) -> dict:
        """
        Calculate all taxes and deductions (Nigerian system)
        
        Args:
            gross_pay: The gross pay amount
            tax_profile: The tax/deduction profile to use
            
        Returns:
            Dictionary with all tax and deduction amounts
        """
        if not tax_profile:
            # Default Nigerian deductions if no profile
            # Assume monthly gross pay, annualize for PIT calculation
            annual_income = gross_pay * Decimal("12")
            annual_pit = self._calculate_nigerian_pit(annual_income)
            monthly_pit = annual_pit / Decimal("12")
            
            pension = gross_pay * Decimal("0.10")  # 10% pension
            nhf = gross_pay * Decimal("0.025")     # 2.5% NHF
            
            return {
                'federal_tax': monthly_pit,  # PIT (Nigerian federal tax)
                'state_tax': Decimal("0.0"),
                'local_tax': Decimal("0.0"),
                'social_security': pension,  # Pension contribution
                'medicare': nhf,             # NHF contribution
                'retirement': Decimal("0.0"),
                'insurance': Decimal("0.0"),
                'other_deductions': Decimal("0.0"),
                'total_taxes': monthly_pit + pension + nhf,
                'total_deductions': Decimal("0.0")
            }
        
        # Calculate Nigerian PIT from profile rate (if using custom rate)
        # Annualize gross pay for progressive calculation
        annual_income = gross_pay * Decimal("12")
        annual_pit = self._calculate_nigerian_pit(annual_income)
        monthly_pit = annual_pit / Decimal("12")
        
        # Use profile rates (federal_tax_rate is PIT rate)
        pit = gross_pay * Decimal(str(tax_profile.federal_tax_rate))
        state_tax = gross_pay * Decimal(str(tax_profile.state_tax_rate))
        local_tax = gross_pay * Decimal(str(tax_profile.local_tax_rate))
        
        # Nigerian statutory deductions
        pension = gross_pay * Decimal(str(tax_profile.social_security_rate))  # Pension
        nhf = gross_pay * Decimal(str(tax_profile.medicare_rate))             # NHF
        
        # Fixed deductions
        retirement = Decimal(str(tax_profile.retirement_withholding))
        insurance = (
            Decimal(str(tax_profile.health_insurance)) +
            Decimal(str(tax_profile.dental_insurance)) +
            Decimal(str(tax_profile.vision_insurance))
        )
        other_deductions = Decimal(str(tax_profile.other_deductions))
        
        total_taxes = pit + state_tax + local_tax + pension + nhf
        total_deductions = retirement + insurance + other_deductions
        
        return {
            'federal_tax': pit,           # PIT (Personal Income Tax)
            'state_tax': state_tax,
            'local_tax': local_tax,
            'social_security': pension,   # Pension contribution
            'medicare': nhf,              # NHF contribution
            'retirement': retirement,
            'insurance': insurance,
            'other_deductions': other_deductions,
            'total_taxes': total_taxes,
            'total_deductions': total_deductions
        }
    
    def create_pay_run(
        self,
        employee_id: int,
        start_period: date,
        end_period: date,
        pay_date: date | None = None,
        bonuses: Decimal = Decimal("0.0"),
        notes: str | None = None
    ) -> PayRun:
        """
        Create a new pay run with calculated values
        
        Args:
            employee_id: The employee's ID
            start_period: Start date of the pay period
            end_period: End date of the pay period
            pay_date: Date the payment will be made
            bonuses: Any additional bonuses
            notes: Optional notes
            
        Returns:
            Created PayRun object
        """
        # Calculate pay
        calc = self.calculate_pay_run(employee_id, start_period, end_period, bonuses)
        
        # Create pay run
        pay_run = PayRun(
            employee_id=employee_id,
            start_period=start_period,
            end_period=end_period,
            pay_date=pay_date,
            regular_hours=calc['regular_hours'],
            overtime_hours=calc['overtime_hours'],
            regular_pay=calc['regular_pay'],
            overtime_pay=calc['overtime_pay'],
            bonuses=calc['bonuses'],
            gross_pay=calc['gross_pay'],
            federal_tax=calc['federal_tax'],
            state_tax=calc['state_tax'],
            local_tax=calc['local_tax'],
            social_security=calc['social_security'],
            medicare=calc['medicare'],
            retirement=calc['retirement'],
            insurance=calc['insurance'],
            other_deductions=calc['other_deductions'],
            total_taxes=calc['total_taxes'],
            total_deductions=calc['total_deductions'],
            net_pay=calc['net_pay'],
            payment_status=PaymentStatus.PENDING,
            notes=notes
        )
        
        self.db.add(pay_run)
        self.db.commit()
        self.db.refresh(pay_run)
        
        return pay_run
    
    def approve_pay_runs(self, pay_run_ids: list[int]) -> list[PayRun]:
        """
        Approve multiple pay runs at once
        
        Args:
            pay_run_ids: List of pay run IDs to approve
            
        Returns:
            List of updated PayRun objects
        """
        pay_runs = self.db.query(PayRun).filter(PayRun.pay_run_id.in_(pay_run_ids)).all()
        
        for pay_run in pay_runs:
            pay_run.payment_status = PaymentStatus.PAID
            pay_run.processed_at = datetime.utcnow()
        
        self.db.commit()
        
        for pay_run in pay_runs:
            self.db.refresh(pay_run)
        
        return pay_runs
    
    def get_payroll_summary(self, start_period: date, end_period: date) -> dict:
        """
        Get summary of all pending payroll for a period
        
        Args:
            start_period: Start date
            end_period: End date
            
        Returns:
            Dictionary with payroll summary statistics
        """
        pay_runs = self.db.query(PayRun).filter(
            and_(
                PayRun.start_period >= start_period,
                PayRun.end_period <= end_period,
                PayRun.payment_status == PaymentStatus.PENDING
            )
        ).all()
        
        total_gross = sum(Decimal(str(pr.gross_pay)) for pr in pay_runs)
        total_taxes = sum(Decimal(str(pr.total_taxes)) for pr in pay_runs)
        total_deductions = sum(Decimal(str(pr.total_deductions)) for pr in pay_runs)
        total_net = sum(Decimal(str(pr.net_pay)) for pr in pay_runs)
        
        return {
            'employee_count': len(pay_runs),
            'total_gross_pay': total_gross,
            'total_taxes': total_taxes,
            'total_deductions': total_deductions,
            'total_net_pay': total_net,
            'pay_runs': pay_runs
        }
