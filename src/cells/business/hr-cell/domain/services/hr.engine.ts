/**
 * HR Engine — Tính lương + thuế TNCN lũy tiến 2025
 * Source: V2 hrEngine.ts (107L) — logic thật
 */

import { EmployeePayroll, HR_FIELDS_LEVELS } from '../entities/employee.entity';

const STANDARD_DAYS = 26;
const GIAM_TRU_BAN_THAN = 11000000;
const GIAM_TRU_NGUOI_PT = 4400000;
const INSURANCE_RATE_EMPLOYEE = 0.105; // 10.5% (BHXH 8% + BHYT 1.5% + BHTN 1%)

/** Thuế TNCN lũy tiến 2025 — 7 bậc */
function calculatePIT(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 5000000) return taxableIncome * 0.05;
  if (taxableIncome <= 10000000) return taxableIncome * 0.10 - 250000;
  if (taxableIncome <= 18000000) return taxableIncome * 0.15 - 750000;
  if (taxableIncome <= 32000000) return taxableIncome * 0.20 - 1650000;
  if (taxableIncome <= 52000000) return taxableIncome * 0.25 - 3250000;
  if (taxableIncome <= 80000000) return taxableIncome * 0.30 - 5850000;
  return taxableIncome * 0.35 - 9850000;
}

/** Tính thâm niên */
export function calculateSeniority(startDateStr: string): string {
  if (!startDateStr) return 'N/A';
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return 'Dữ liệu lỗi';
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (months < 0) { years--; months += 12; }
  return years > 0 ? `${years} năm, ${months} tháng` : `${months} tháng`;
}

/** Tính lương đầy đủ */
export function processPayroll(employee: EmployeePayroll): EmployeePayroll {
  const grossSalary = (employee.baseSalary / STANDARD_DAYS) * employee.actualWorkDays;
  const insuranceEmployee = (employee.insuranceSalary || 5000000) * INSURANCE_RATE_EMPLOYEE;
  const totalTaxableIncome = grossSalary + employee.allowanceLunch;
  const totalDeductions = insuranceEmployee + GIAM_TRU_BAN_THAN + (employee.dependents * GIAM_TRU_NGUOI_PT);
  const incomeForTax = Math.max(0, totalTaxableIncome - totalDeductions);
  const tax = calculatePIT(incomeForTax);

  return {
    ...employee,
    seniority: calculateSeniority(employee.startDate),
    grossSalary: Math.round(grossSalary),
    insuranceEmployee: Math.round(insuranceEmployee),
    personalTax: Math.round(tax),
    netSalary: Math.round(grossSalary + employee.allowanceLunch - insuranceEmployee - tax),
  };
}

/** Field-level security — V2 logic */
export function checkFieldPermission(roleLevel: number, field: string): boolean {
  if (roleLevel <= 1 || roleLevel === 8) return true; // Master, CEO, Auditor = full
  if (roleLevel <= 3) return HR_FIELDS_LEVELS.BASIC.includes(field) || HR_FIELDS_LEVELS.WORK.includes(field);
  if (roleLevel === 5) return HR_FIELDS_LEVELS.FINANCE.includes(field) || HR_FIELDS_LEVELS.INSURANCE.includes(field);
  return HR_FIELDS_LEVELS.BASIC.includes(field);
}

/** Validate CCCD — 12 chữ số */
export function validateCCCD(cccd: string): boolean { return /^\d{12}$/.test(cccd); }

/** Validate MST — 10 hoặc 13 chữ số */
export function validateTaxID(taxId: string): boolean { return /^\d{10}(\d{3})?$/.test(taxId); }

/** Validate SĐT Việt Nam */
export function validatePhone(phone: string): boolean { return /^(0|84)(3|5|7|8|9)([0-9]{8})$/.test(phone); }
