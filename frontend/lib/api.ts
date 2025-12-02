/**
 * API Client for Payroll Management System
 * Centralized API communication layer
 */

import axios from 'axios';
import type {
  Employee,
  EmployeeCreate,
  WorkHours,
  WorkHoursCreate,
  PayRun,
  PayRunCreate,
  TaxDeductionProfile,
  PayrollDashboard,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
  },
});

// Request interceptor for adding API key to all requests
api.interceptors.request.use(
  (config) => {
    // Add API key to every request
    if (API_KEY) {
      config.headers['X-API-Key'] = API_KEY;
    }
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ==================== Employee API ====================

export const employeeApi = {
  getAll: (params?: { skip?: number; limit?: number; status?: string }) => 
    api.get<Employee[]>('/employees/', { params }),
  
  getById: (id: number) => 
    api.get<Employee>(`/employees/${id}/`),
  
  create: (data: EmployeeCreate) => 
    api.post<Employee>('/employees/', data),
  
  update: (id: number, data: Partial<EmployeeCreate>) => 
    api.put<Employee>(`/employees/${id}/`, data),
  
  delete: (id: number) => 
    api.delete(`/employees/${id}/`),
  
  getSummary: (id: number) => 
    api.get(`/employees/${id}/summary/`),
};

// ==================== Work Hours API ====================

export const workHoursApi = {
  getAll: (params?: {
    employee_id?: number;
    start_date?: string;
    end_date?: string;
    approved?: boolean;
    skip?: number;
    limit?: number;
  }) => 
    api.get<WorkHours[]>('/work-hours/', { params }),
  
  getById: (id: number) => 
    api.get<WorkHours>(`/work-hours/${id}/`),
  
  create: (data: WorkHoursCreate) => 
    api.post<WorkHours>('/work-hours/', data),
  
  update: (id: number, data: Partial<WorkHoursCreate>) => 
    api.put<WorkHours>(`/work-hours/${id}/`, data),
  
  delete: (id: number) => 
    api.delete(`/work-hours/${id}/`),
  
  approve: (id: number, approvedBy: string) => 
    api.post<WorkHours>(`/work-hours/${id}/approve/?approved_by=${approvedBy}`),
  
  bulkApprove: (recordIds: number[], approvedBy: string) => 
    api.post('/work-hours/bulk-approve/', null, {
      params: { record_ids: recordIds, approved_by: approvedBy },
    }),
};

// ==================== Pay Runs API ====================

export const payRunApi = {
  getAll: (params?: {
    employee_id?: number;
    start_date?: string;
    end_date?: string;
    payment_status?: string;
    skip?: number;
    limit?: number;
  }) => 
    api.get<PayRun[]>('/pay-runs/', { params }),
  
  getById: (id: number) => 
    api.get<PayRun>(`/pay-runs/${id}/`),
  
  create: (data: PayRunCreate) => 
    api.post<PayRun>('/pay-runs/', data),
  
  update: (id: number, data: Partial<PayRunCreate>) => 
    api.put<PayRun>(`/pay-runs/${id}/`, data),
  
  delete: (id: number) => 
    api.delete(`/pay-runs/${id}/`),
  
  recalculate: (id: number) => 
    api.post<PayRun>(`/pay-runs/${id}/recalculate/`),
  
  approve: (payRunIds: number[]) => 
    api.post<PayRun[]>('/pay-runs/approve/', {
      pay_run_ids: payRunIds,
      payment_status: 'paid',
    }),
  
  getDashboard: (startPeriod: string, endPeriod: string) => 
    api.get<PayrollDashboard>('/pay-runs/summary/dashboard/', {
      params: { start_period: startPeriod, end_period: endPeriod },
    }),
};

// ==================== Tax & Deduction Profiles API ====================

export const taxProfileApi = {
  getAll: (params?: { skip?: number; limit?: number }) => 
    api.get<TaxDeductionProfile[]>('/taxes-deductions/', { params }),
  
  getById: (id: number) => 
    api.get<TaxDeductionProfile>(`/taxes-deductions/${id}/`),
  
  create: (data: Partial<TaxDeductionProfile>) => 
    api.post<TaxDeductionProfile>('/taxes-deductions/', data),
  
  update: (id: number, data: Partial<TaxDeductionProfile>) => 
    api.put<TaxDeductionProfile>(`/taxes-deductions/${id}/`, data),
  
  delete: (id: number) => 
    api.delete(`/taxes-deductions/${id}/`),
};

// SWR fetcher function
export const fetcher = (url: string) => api.get(url).then(res => res.data);

export default api;
