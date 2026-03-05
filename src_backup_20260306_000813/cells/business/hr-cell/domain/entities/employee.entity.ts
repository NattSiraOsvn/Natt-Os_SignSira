/**
 * Employee Entity — Nhân sự Tâm Luxury
 * Source: V2 hrEngine.ts HR_FIELDS_LEVELS + personnelEngine.ts profiles
 */

export interface EmployeePayroll {
  employeeCode: string;
  fullName: string;
  position: string;
  department: string;
  startDate: string;
  baseSalary: number;
  actualWorkDays: number;
  insuranceSalary: number;
  dependents: number;
  allowanceLunch: number;
  allowancePosition?: number;
  bankAccountNo?: string;
  bankName?: string;
  // Calculated
  grossSalary?: number;
  insuranceEmployee?: number;
  personalTax?: number;
  netSalary?: number;
  seniority?: string;
}

export const HR_FIELDS_LEVELS = {
  BASIC: ['fullName', 'dob', 'gender', 'nationality', 'ethnic', 'idCard', 'originAddress', 'permanentAddress', 'temporaryAddress', 'contactAddress', 'email', 'phone'],
  WORK: ['employeeCode', 'status', 'department', 'position', 'workPlace', 'contractNo', 'contractDate', 'contractType', 'approvalStatus'],
  FINANCE: ['baseSalary', 'salaryFactor', 'allowanceLunch', 'allowancePosition', 'bankAccountOwner', 'bankAccountNo', 'bankName', 'bankBranch', 'bankCode'],
  INSURANCE: ['insuranceCode', 'insuranceBookNo', 'medicalCardNo', 'contributionRate', 'minWageRegion', 'contributionAmount', 'medicalRegistration', 'medicalCode', 'medicalUnit'],
} as const;
