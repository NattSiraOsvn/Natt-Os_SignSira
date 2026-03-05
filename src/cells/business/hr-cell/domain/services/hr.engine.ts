// ============================================================================
// src/cells/business/hr-cell/domain/services/hr.engine.ts
// Merged: hr.engine.ts + hr-service.ts + personnel-engine.ts
// DIRECTIVE: Labor law, payroll rules, field permissions đều pluggable
// Migrated by Băng — 2026-03-06
// ============================================================================

import { EmployeePayroll } from '@/types';
import { UDP, UDPDomain, DomainExtractor } from '@/core/ingestion/udp.pipeline';
import { HR_FIELDS_LEVELS } from '../entities/employee.entity';

// ============================================================================
// CONFIG — Pluggable. BHXH rate thay đổi → chỉ update config
// ============================================================================

export interface HRRuleConfig {
  standardWorkDays: number;
  insurance: {
    employeeRate: number;    // 10.5% = BHXH 8% + BHYT 1.5% + BHTN 1%
    employerRate: number;    // 21.5% = BHXH 17.5% + BHYT 3% + BHTN 1%
    minWage: number;         // Lương tối thiểu vùng (VND)
  };
  pit: {
    personalDeduction: number;   // Giảm trừ bản thân
    dependentDeduction: number;  // Giảm trừ người phụ thuộc
  };
  seniority: {
    bonusPerYear: number;        // Phụ cấp thâm niên/năm (%)
    startAfterYears: number;     // Bắt đầu tính sau N năm
  };
}

const DEFAULT_HR_CONFIG: HRRuleConfig = {
  standardWorkDays: 26,
  insurance: {
    employeeRate: 0.105,   // 10.5%
    employerRate: 0.215,   // 21.5%
    minWage: 4_680_000     // Vùng 1 — 2024
  },
  pit: {
    personalDeduction: 11_000_000,
    dependentDeduction: 4_400_000
  },
  seniority: {
    bonusPerYear: 0.05,    // 5%/năm
    startAfterYears: 3     // Từ năm thứ 3
  }
};

// ============================================================================
// PIT — Biểu thuế lũy tiến 7 bậc (rút gọn, công thức trừ lùi)
// ============================================================================

function calculatePIT(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 5_000_000)  return taxableIncome * 0.05;
  if (taxableIncome <= 10_000_000) return taxableIncome * 0.10 - 250_000;
  if (taxableIncome <= 18_000_000) return taxableIncome * 0.15 - 750_000;
  if (taxableIncome <= 32_000_000) return taxableIncome * 0.20 - 1_650_000;
  if (taxableIncome <= 52_000_000) return taxableIncome * 0.25 - 3_250_000;
  if (taxableIncome <= 80_000_000) return taxableIncome * 0.30 - 5_850_000;
  return taxableIncome * 0.35 - 9_850_000;
}

// ============================================================================
// HR ENGINE
// ============================================================================

export class HREngine {
  private static instance: HREngine;
  private config: HRRuleConfig = { ...DEFAULT_HR_CONFIG };

  static getInstance(): HREngine {
    if (!HREngine.instance) {
      HREngine.instance = new HREngine();
      HREngine.instance.registerUDPExtractor();
    }
    return HREngine.instance;
  }

  updateConfig(partial: Partial<HRRuleConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  // ─── Thâm niên ───────────────────────────────────────────────────────────

  calculateSeniority(startDateStr: string): string {
    if (!startDateStr) return 'N/A';
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return 'Dữ liệu lỗi';
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) { years--; months += 12; }
    return years > 0 ? `${years} năm, ${months} tháng` : `${months} tháng`;
  }

  private getSeniorityBonus(startDateStr: string, baseSalary: number): number {
    if (!startDateStr) return 0;
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return 0;
    const years = (Date.now() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (years < this.config.seniority.startAfterYears) return 0;
    return baseSalary * this.config.seniority.bonusPerYear * Math.floor(years);
  }

  // ─── Payroll ──────────────────────────────────────────────────────────────

  processPayroll(employee: EmployeePayroll): EmployeePayroll {
    const { standardWorkDays, insurance, pit } = this.config;

    // Lương thực tế theo ngày công
    const grossSalary = (employee.baseSalary / standardWorkDays) * (employee.actualWorkDays || standardWorkDays);

    // Phụ cấp thâm niên
    const seniorityBonus = this.getSeniorityBonus(employee.startDate || '', employee.baseSalary);

    // BHXH, BHYT, BHTN — tính trên lương đóng BH (tối thiểu min wage)
    const insuranceBase = Math.max(
      employee.insuranceSalary || employee.baseSalary,
      insurance.minWage
    );
    const insuranceEmployee = insuranceBase * insurance.employeeRate;
    const insuranceEmployer = insuranceBase * insurance.employerRate;

    // Thu nhập chịu thuế
    const totalIncome = grossSalary + (employee.allowanceLunch || 0) + seniorityBonus;
    const dependents = (employee as any).dependents || 0;
    const totalDeductions = insuranceEmployee + pit.personalDeduction + (dependents * pit.dependentDeduction);
    const incomeForTax = Math.max(0, totalIncome - totalDeductions);
    const personalTax = calculatePIT(incomeForTax);

    // Net
    const netSalary = grossSalary + (employee.allowanceLunch || 0) + seniorityBonus - insuranceEmployee - personalTax;

    return {
      ...employee,
      seniority: this.calculateSeniority(employee.startDate || ''),
      grossSalary: Math.round(grossSalary),
      insuranceEmployee: Math.round(insuranceEmployee),
      insuranceEmployer: Math.round(insuranceEmployer),
      taxableIncome: Math.round(incomeForTax),
      personalTax: Math.round(personalTax),
      netSalary: Math.round(netSalary),
      seniorityBonus: Math.round(seniorityBonus)
    };
  }

  processBatchPayroll(employees: EmployeePayroll[]): EmployeePayroll[] {
    return employees.map(e => this.processPayroll(e));
  }

  // ─── Field Permission ─────────────────────────────────────────────────────

  checkFieldPermission(roleLevel: number, field: string): boolean {
    if (roleLevel <= 1 || roleLevel === 8) return true; // Master, CEO, Auditor = full
    if (roleLevel <= 3) return (
      HR_FIELDS_LEVELS.BASIC.includes(field) ||
      HR_FIELDS_LEVELS.WORK.includes(field)
    );
    if (roleLevel === 5) return (
      HR_FIELDS_LEVELS.FINANCE.includes(field) ||
      HR_FIELDS_LEVELS.INSURANCE.includes(field)
    );
    return HR_FIELDS_LEVELS.BASIC.includes(field);
  }

  // ─── Validators ───────────────────────────────────────────────────────────

  validateCCCD(cccd: string): boolean { return /^\d{12}$/.test(cccd); }
  validateTaxID(taxId: string): boolean { return /^\d{10}(\d{3})?$/.test(taxId); }
  validatePhone(phone: string): boolean { return /^(0|84)(3|5|7|8|9)([0-9]{8})$/.test(phone); }

  validateEmployee(employee: Partial<EmployeePayroll>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!employee.name) errors.push('Thiếu tên nhân viên');
    if (!employee.employeeCode) errors.push('Thiếu mã nhân viên');
    if (!employee.baseSalary || employee.baseSalary < this.config.insurance.minWage) {
      errors.push(`Lương cơ bản thấp hơn mức tối thiểu vùng (${this.config.insurance.minWage.toLocaleString('vi-VN')}đ)`);
    }
    if ((employee as any).cccd && !this.validateCCCD((employee as any).cccd)) {
      errors.push('CCCD không hợp lệ (cần 12 chữ số)');
    }
    return { valid: errors.length === 0, errors };
  }

  // ─── UDP Extractor ────────────────────────────────────────────────────────

  private registerUDPExtractor(): void {
    const hrExtractor: DomainExtractor = {
      extract: (payload) => {
        const raw = payload.rawContent as Record<string, unknown>;
        return {
          employees: raw.employees || raw.nhanVien || [],
          period: raw.period || raw.ky || raw.thang,
          department: raw.department || raw.phongBan,
          submittedBy: payload.submittedBy
        };
      },
      validate: (data) => {
        const errors: string[] = [];
        if (!data.period) errors.push('Thiếu kỳ tính lương');
        if (!Array.isArray(data.employees) || (data.employees as unknown[]).length === 0) {
          errors.push('Không có dữ liệu nhân viên');
        }
        return { valid: errors.length === 0, errors };
      }
    };

    UDP.registerExtractor('HR' as UDPDomain, hrExtractor);
  }
}

export const HRCell = HREngine.getInstance();
