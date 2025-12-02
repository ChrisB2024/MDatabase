# Nigerian Payroll System - Implementation Guide

## ✅ Completed Changes

### 1. Currency Updates
- Created `lib/utils.ts` with `formatNaira()` function
- Updated all currency fields to use ₦ (Naira) symbol
- Files updated:
  - `/components/AddEmployeeModal.tsx` - Hourly rate, salary fields
  - `/components/AddTaxProfileModal.tsx` - All insurance and deduction fields

### 2. Nigerian Tax System Implementation
- Updated tax rates to Nigerian standards:
  - Personal Income Tax (PIT): Progressive rates 7%-24%
  - Pension Contribution: 10% employer minimum
  - National Housing Fund (NHF): 2.5%
  - VAT: 7.5%
  - Companies Income Tax (CIT): 30%
  
- Created `NIGERIAN_TAX_RATES` constant in `lib/utils.ts`
- Updated AddTaxProfileModal defaults to Nigerian rates

### 3. Export Functionality
- Added `exportToCSV()` function in `lib/utils.ts`
- Ready to integrate into all list pages

## 🔧 Remaining Tasks

### Phase 1: Complete Currency Conversion
Update these files to use `formatNaira()`:

```typescript
// Import in each file:
import { formatNaira } from '@/lib/utils';

// Replace patterns like:
${amount.toFixed(2)}
// With:
{formatNaira(amount)}
```

**Files to update:**
1. `/app/page.tsx` - Dashboard stats (lines 121, 137, 153, 203-205)
2. `/app/payroll/page.tsx` - Payroll list (lines 52-54)
3. `/app/payroll/[id]/page.tsx` - Payroll details (lines 145, 196)
4. `/app/settings/page.tsx` - Tax profile percentages (lines 52-54)

### Phase 2: Add View/Edit Modals

#### A. View Employee Modal
Create `/components/ViewEmployeeModal.tsx`:
```typescript
- Display all employee information in read-only format
- Show employment history
- Display current pay information in Naira
- Show linked tax profile
```

#### B. Edit Employee Modal
Create `/components/EditEmployeeModal.tsx`:
- Same fields as AddEmployeeModal
- Pre-populate with existing data
- Update via PATCH/PUT endpoint

#### C. Edit Work Hours Modal
Create `/components/EditWorkHoursModal.tsx`:
- Allow editing of hours_worked and overtime_hours
- Update approval status
- Add approval_by field

#### D. Edit Tax Profile Modal
Create `/components/EditTaxProfileModal.tsx`:
- Pre-populate existing profile data
- Update via PATCH/PUT endpoint

### Phase 3: Add Download Functionality

Add to each list page:

```typescript
import { exportToCSV } from '@/lib/utils';
import { IconDownload } from '@tabler/icons-react';

// Add download button:
<Button
  leftSection={<IconDownload size={16} />}
  onClick={() => exportToCSV(data, 'filename')}
>
  Export to CSV
</Button>
```

**Pages to update:**
1. `/app/employees/page.tsx`
2. `/app/work-hours/page.tsx`
3. `/app/payroll/page.tsx`
4. `/app/settings/page.tsx`

### Phase 4: Backend Updates for Nigerian System

Update `/backend/app/schemas.py`:
```python
# Update default tax rates
class TaxDeductionProfileBase(BaseModel):
    federal_tax_rate: Decimal = Field(default=Decimal("0.24"))  # PIT 24%
    social_security_rate: Decimal = Field(default=Decimal("0.10"))  # Pension 10%
    medicare_rate: Decimal = Field(default=Decimal("0.025"))  # NHF 2.5%
```

Update `/backend/app/services/payroll.py`:
```python
def calculate_nigerian_pit(self, annual_income: Decimal) -> Decimal:
    """Calculate Nigerian Personal Income Tax"""
    if annual_income <= 800000:  # Tax-free threshold
        return Decimal("0")
    
    brackets = [
        (300000, Decimal("0.07")),
        (300000, Decimal("0.11")),
        (500000, Decimal("0.15")),
        (500000, Decimal("0.19")),
        (1600000, Decimal("0.21")),
        (float('inf'), Decimal("0.24")),
    ]
    
    tax = Decimal("0")
    taxable = annual_income
    
    for amount, rate in brackets:
        if taxable <= 0:
            break
        taxed_amount = min(taxable, Decimal(str(amount)))
        tax += taxed_amount * rate
        taxable -= taxed_amount
    
    return tax
```

## 📋 Quick Implementation Checklist

### Immediate (30 minutes):
- [ ] Update dashboard currency displays
- [ ] Update payroll page currency displays
- [ ] Add download buttons to all list pages

### Short-term (2-3 hours):
- [ ] Create ViewEmployeeModal component
- [ ] Create EditEmployeeModal component
- [ ] Integrate view/edit buttons in employees page
- [ ] Create EditWorkHoursModal component
- [ ] Create EditTaxProfileModal component

### Medium-term (1 day):
- [ ] Update backend tax calculation logic
- [ ] Add Nigerian PIT calculation
- [ ] Update database seed data with Nigerian examples
- [ ] Add pension and NHF calculations to payroll

### Long-term (2-3 days):
- [ ] Add VAT calculations if applicable
- [ ] Add Development Levy (4%) calculations
- [ ] Add Withholding Tax options
- [ ] Create Nigerian payslip template
- [ ] Add tax filing reports

## 🔑 Key Nigerian Tax Information

### Personal Income Tax (PIT) Brackets:
| Income Range | Rate |
|--------------|------|
| First ₦300,000 | 7% |
| Next ₦300,000 | 11% |
| Next ₦500,000 | 15% |
| Next ₦500,000 | 19% |
| Next ₦1,600,000 | 21% |
| Above ₦3,200,000 | 24% |

### Payroll Deductions:
- **Pension (Employer)**: Minimum 10% of monthly emolument
- **Pension (Employee)**: Minimum 8% of monthly emolument
- **National Housing Fund**: 2.5% of basic salary (for employees earning ≥₦3,000/month)
- **Tax-free Threshold**: ₦800,000 per annum

### Other Nigerian Taxes:
- **VAT**: 7.5% (applies to goods and services)
- **Development Levy**: 4% on assessable profits (non-small companies)
- **Withholding Tax**: 5-10% depending on payment type
- **Companies Income Tax**: 30% (exempt for companies with turnover ≤₦50M)

## 🚀 Deployment Notes

When deploying to production:
1. Ensure all amounts are stored in kobo (smallest unit) in database
2. Set default pay_periods_per_year to 12 (monthly is most common in Nigeria)
3. Add state selection for state-specific tax rates
4. Consider adding support for multiple bank accounts (some employees have multiple)
5. Add NIBSS/BVN validation for Nigerian bank accounts

## 📞 Support

For questions about Nigerian tax regulations:
- Federal Inland Revenue Service (FIRS): https://www.firs.gov.ng/
- PenCom (Pension): https://www.pencom.gov.ng/
- Tax laws: Finance Act 2025

