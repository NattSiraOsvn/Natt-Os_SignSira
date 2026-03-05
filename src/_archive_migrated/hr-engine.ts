/**
 * 🛠️ HR ENGINE — Field-level security + Payroll
 * Source: NATTCELL KERNEL → Rewritten for Permission Architecture v2
 */
import { EmployeePayroll, SalaryRule, UserRole } from '../types';
import { SystemRole, TenantRole } from '../types';

export const HR_FIELDS_LEVELS = {
  BASIC: ['fullName', 'dob', 'gender', 'nationality', 'ethnic', 'idCard', 'originAddress', 'permanentAddress', 'temporaryAddress', 'contactAddress', 'email', 'phone'],
  WORK: ['employeeCode', 'status', 'department', 'position', 'workPlace', 'contractNo', 'contractDate', 'contractType', 'approvalStatus'],
  FINANCE: ['baseSalary', 'salaryFactor', 'allowanceLunch', 'allowancePosition', 'bankAccountOwner', 'bankAccountNo', 'bankName', 'bankBranch', 'bankCode'],
  INSURANCE: ['insuranceCode', 'insuranceBookNo', 'medicalCardNo', 'contributionRate', 'minWageRegion', 'contributionAmount', 'medicalRegistration', 'medicalCode', 'medicalUnit']
};

export class HREngine {
  static normalize(str: string): string {
    if (!str) return "";
    return str.toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\u0111/g, "d");
  }

  static validateCCCD(cccd: string): boolean {
    return /^\d{12}$/.test(cccd);
  }

  static validateTaxID(taxId: string): boolean {
    return /^\d{10}(\d{3})?$/.test(taxId);
  }

  static validatePhone(phone: string): boolean {
    return /^(0|84)(3|5|7|8|9)([0-9]{8})$/.test(phone);
  }

  /**
   * Field-level security — Permission Architecture v2
   * MASTER: 100% | OWNER/NATE: BASIC+WORK | NATTE(accountant): FINANCE+INSURANCE | NAT: BASIC
   * Legacy UserRole mapped through for backward compat
   */
  static checkPermission(role: string, field: string): boolean {
    // SystemRole.MASTER — full access
    if (role === SystemRole.MASTER || role === UserRole.MASTER) return true;

    // OWNER + NATE (Truong khoi/phong) — BASIC + WORK
    if (role === TenantRole.OWNER || role === TenantRole.NATE ||
        role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.LEVEL_2) {
      return HR_FIELDS_LEVELS.BASIC.includes(field) || HR_FIELDS_LEVELS.WORK.includes(field);
    }

    // NATTE chuyên mon ke toan — FINANCE + INSURANCE
    if (role === TenantRole.NATTE || role === UserRole.ACCOUNTANT || role === UserRole.LEVEL_5) {
      return HR_FIELDS_LEVELS.FINANCE.includes(field) || HR_FIELDS_LEVELS.INSURANCE.includes(field);
    }

    // AUDITOR — full read (special case)
    if (role === UserRole.AUDITOR) return true;

    // NAT / default — BASIC only
    return HR_FIELDS_LEVELS.BASIC.includes(field);
  }

  static calculateSeniority(startDateStr: string): string {
    if (!startDateStr) return "N/A";
    const start = new Date(startDateStr);
    const now = new Date();
    if (isNaN(start.getTime())) return "Du lieu loi";

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) { years--; months += 12; }
    return years > 0 ? years + " nam, " + months + " thang" : months + " thang";
  }

  static processPayroll(employee: EmployeePayroll, _rules: SalaryRule[]): EmployeePayroll {
    const standardDays = 26;
    const GIAM_TRU_BAN_THAN = 11000000;
    const GIAM_TRU_NGUOI_PT = 4400000;

    const grossSalary = (employee.baseSalary / standardDays) * employee.actualWorkDays;
    const insuranceEmployee = (employee.insuranceSalary || 5000000) * 0.105;

    const totalTaxableIncome = grossSalary + employee.allowanceLunch;
    const totalDeductions = insuranceEmployee + GIAM_TRU_BAN_THAN + (employee.dependents * GIAM_TRU_NGUOI_PT);
    const incomeForTax = Math.max(0, totalTaxableIncome - totalDeductions);

    // Thue TNCN luy tien 2025
    let tax = 0;
    if (incomeForTax <= 5000000) tax = incomeForTax * 0.05;
    else if (incomeForTax <= 10000000) tax = incomeForTax * 0.1 - 250000;
    else if (incomeForTax <= 18000000) tax = incomeForTax * 0.15 - 750000;
    else tax = incomeForTax * 0.2 - 1650000;

    return {
      ...employee,
      seniority: this.calculateSeniority(employee.startDate),
      grossSalary: Math.round(grossSalary),
      insuranceEmployee: Math.round(insuranceEmployee),
      personalTax: Math.round(tax),
      netSalary: Math.round(grossSalary + employee.allowanceLunch - insuranceEmployee - tax)
    };
  }
}
