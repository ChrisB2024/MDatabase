/**
 * Utility functions for the Payroll Management System
 */

/**
 * Format number as Nigerian Naira currency
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string with ₦ symbol
 */
export function formatNaira(amount: number | string, decimals: number = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return '₦0.00';
  
  return `₦${num.toLocaleString('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format percentage
 * @param rate - The rate as decimal (e.g., 0.075 for 7.5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(rate: number | string, decimals: number = 2): string {
  const num = typeof rate === 'string' ? parseFloat(rate) : rate;
  
  if (isNaN(num)) return '0%';
  
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * Export data to CSV format
 * @param data - Array of objects to export
 * @param filename - Name of the file to download
 */
export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Nigerian tax rates and calculations
 */
export const NIGERIAN_TAX_RATES = {
  // Personal Income Tax (PIT) - Progressive rates
  PIT_BRACKETS: [
    { max: 300000, rate: 0.07 },      // First ₦300,000 at 7%
    { max: 300000, rate: 0.11 },      // Next ₦300,000 at 11%
    { max: 500000, rate: 0.15 },      // Next ₦500,000 at 15%
    { max: 500000, rate: 0.19 },      // Next ₦500,000 at 19%
    { max: 1600000, rate: 0.21 },     // Next ₦1,600,000 at 21%
    { max: Infinity, rate: 0.24 },    // Above ₦3,200,000 at 24%
  ],
  
  // Standard rates
  CIT: 0.30,                  // Companies Income Tax - 30%
  SMALL_COMPANY_CIT: 0,       // Exempt for turnover ≤ ₦50M
  CGT_COMPANY: 0.30,          // Capital Gains Tax for companies - 30%
  DEVELOPMENT_LEVY: 0.04,     // 4% on assessable profits
  VAT: 0.075,                 // Value Added Tax - 7.5%
  
  // Payroll contributions
  PENSION_EMPLOYER: 0.10,     // Minimum 10% employer contribution
  PENSION_EMPLOYEE: 0.08,     // Minimum 8% employee contribution
  NHF: 0.025,                 // National Housing Fund - 2.5% of basic salary
  
  // Withholding Tax rates
  WHT_DIVIDEND: 0.10,         // 10%
  WHT_INTEREST: 0.10,         // 10%
  WHT_RENT: 0.10,            // 10%
  WHT_CONTRACT: 0.05,         // 5%
};

/**
 * Calculate Nigerian Personal Income Tax
 * @param annualIncome - Annual income in Naira
 * @returns Calculated tax amount
 */
export function calculateNigerianPIT(annualIncome: number): number {
  // Tax-free threshold is ₦800,000
  if (annualIncome <= 800000) return 0;
  
  let taxableIncome = annualIncome;
  let totalTax = 0;
  
  for (const bracket of NIGERIAN_TAX_RATES.PIT_BRACKETS) {
    if (taxableIncome <= 0) break;
    
    const taxableAmount = Math.min(taxableIncome, bracket.max);
    totalTax += taxableAmount * bracket.rate;
    taxableIncome -= taxableAmount;
  }
  
  return totalTax;
}
