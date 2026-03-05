export interface HRCellContract {
  'hr.employee.onboarded': { employeeCode: string; fullName: string; department: string; position: string };
  'hr.employee.terminated': { employeeCode: string; reason: string; effectiveDate: string };
  'hr.payroll.calculated': { period: string; totalGross: number; totalNet: number; totalTax: number; totalInsurance: number; employeeCount: number };
  'hr.payroll.approved': { period: string; approvedBy: string };
  'hr.attendance.closed': { period: string; employeeCode: string; workDays: number };
}
