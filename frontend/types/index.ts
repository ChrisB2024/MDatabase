/**
 * Type definitions for the Payroll Management System
 */

export type PayType = 'hourly' | 'salary';
export type EmployeeStatus = 'active' | 'inactive';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface TaxDeductionProfile {
  profile_id: number;
  profile_name: string;
  federal_tax_rate: number;
  state_tax_rate: number;
  local_tax_rate: number;
  social_security_rate: number;
  medicare_rate: number;
  retirement_withholding: number;
  health_insurance: number;
  dental_insurance: number;
  vision_insurance: number;
  other_deductions: number;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface TaxDeductionProfileCreate {
  profile_name: string;
  federal_tax_rate?: number;
  state_tax_rate?: number;
  local_tax_rate?: number;
  social_security_rate?: number;
  medicare_rate?: number;
  retirement_withholding?: number;
  health_insurance?: number;
  dental_insurance?: number;
  vision_insurance?: number;
  other_deductions?: number;
  description?: string;
}

export interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  start_date: string;
  end_date?: string;
  status: EmployeeStatus;
  pay_type: PayType;
  hourly_rate?: number;
  salary_amount?: number;
  overtime_rate?: number;
  pay_periods_per_year: number;
  tax_deduction_profile_id?: number;
  bank_account?: string;
  routing_number?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface EmployeeCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  start_date: string;
  end_date?: string;
  status?: EmployeeStatus;
  pay_type: PayType;
  hourly_rate?: number;
  salary_amount?: number;
  overtime_rate?: number;
  pay_periods_per_year?: number;
  tax_deduction_profile_id?: number;
  bank_account?: string;
  routing_number?: string;
  notes?: string;
}

export interface WorkHours {
  record_id: number;
  employee_id: number;
  date: string;
  hours_worked: number;
  overtime_hours: number;
  notes?: string;
  approved_by?: string;
  is_approved: boolean;
  created_at: string;
  updated_at?: string;
}

export interface WorkHoursCreate {
  employee_id: number;
  date: string;
  hours_worked: number;
  overtime_hours?: number;
  notes?: string;
  approved_by?: string;
  is_approved?: boolean;
}

export interface PayRun {
  pay_run_id: number;
  employee_id: number;
  start_period: string;
  end_period: string;
  pay_date?: string;
  regular_hours: number;
  overtime_hours: number;
  regular_pay: number;
  overtime_pay: number;
  bonuses: number;
  gross_pay: number;
  federal_tax: number;
  state_tax: number;
  local_tax: number;
  social_security: number;
  medicare: number;
  retirement: number;
  insurance: number;
  other_deductions: number;
  total_taxes: number;
  total_deductions: number;
  net_pay: number;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
  processed_at?: string;
}

export interface PayRunCreate {
  employee_id: number;
  start_period: string;
  end_period: string;
  pay_date?: string;
  bonuses?: number;
  notes?: string;
}

export interface PayRunSummary {
  pay_run_id: number;
  employee_id: number;
  employee_name: string;
  start_period: string;
  end_period: string;
  gross_pay: number;
  total_taxes: number;
  total_deductions: number;
  net_pay: number;
  payment_status: PaymentStatus;
}

export interface PayrollDashboard {
  summary: {
    employee_count: number;
    total_gross_pay: number;
    total_taxes: number;
    total_deductions: number;
    total_net_pay: number;
  };
  pay_runs: PayRunSummary[];
}
