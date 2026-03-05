#!/usr/bin/env python3
"""
NATTCELL → GOLDMASTER MERGE — BATCH B (3 modules, 376L)
Medium risk: enum casing fixes required.

Modules:
  6. CostAllocationSystem (88L) — fix reference field + excess props
  7. authService (181L) — 13 UserRole enum rewrites
  8. personnelEngine (108L) — Department + UserRole enum rewrites

CRITICAL FIXES:
  - UserRole.MASTER → .master (goldmaster uses lowercase enum keys)
  - Department.FINANCE → .finance
  - CostAllocation: add missing `reference: {}` field
  - CostAllocation: remove `amount`/`type` excess props from AccountingLine

Run AFTER batch_a_merge.py succeeds with clean tsc.
"""

import os
import sys

GM = os.path.expanduser(
    "~/Desktop/HỒ SƠ SHTT NATT-OS BY NATTSIRA-OS/natt-os ver2goldmaster"
)

DRY_RUN = "--dry" in sys.argv


def write_file(rel_path: str, content: str, label: str):
    full = os.path.join(GM, rel_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    if DRY_RUN:
        print(f"  [DRY] Would write {rel_path} ({len(content.splitlines())}L)")
        return
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✅ {label} → {rel_path} ({len(content.splitlines())}L)")


# ═══════════════════════════════════════════════════════════════
# MODULE 6: CostAllocationSystem (88L)
# FIX 1: AccountingEntry needs `reference: Record<string,any>`
# FIX 2: AccountingLine has no `amount`/`type` fields
# ═══════════════════════════════════════════════════════════════
def module_6_cost_allocation():
    print("\n[6] CostAllocationSystem")
    content = '''\
import { CostAllocation, AccountingEntry } from '../../types';

/**
 * ⚖️ COST ALLOCATION SYSTEM
 * Phân bổ chi phí chung (Overhead) dựa trên tiêu thức doanh thu/nhân sự.
 * Source: NATTCELL KERNEL
 * FIX: AccountingEntry.reference added, AccountingLine excess props removed
 */
export class CostAllocationSystem {

  /**
   * Tính toán phân bổ chi phí
   */
  static allocateByRevenue(
    totalCost: number,
    costType: 'MARKETING' | 'RENT' | 'OPERATIONS',
    drivers: { costCenter: string, revenue: number }[]
  ): CostAllocation {

    const totalRevenue = drivers.reduce((sum, d) => sum + d.revenue, 0);

    const allocations = drivers.map(d => {
      const ratio = totalRevenue > 0 ? d.revenue / totalRevenue : 0;
      return {
        costCenter: d.costCenter,
        allocatedAmount: Math.round(totalCost * ratio),
        allocationRatio: ratio,
        basis: `Revenue Share: ${(ratio * 100).toFixed(1)}%`
      };
    });

    return {
      costId: `COST-${Date.now()}`,
      costType,
      totalAmount: totalCost,
      allocationMethod: 'REVENUE_BASED',
      allocationDate: Date.now(),
      allocations
    };
  }

  /**
   * Tạo bút toán kế toán từ kết quả phân bổ
   * Nợ 641/642 (Chi tiết theo Cost Center) / Có 242 (Chi phí trả trước)
   */
  static generateJournalEntries(allocation: CostAllocation): AccountingEntry {
    // FIX: AccountingLine only has: accountNumber, accountName, debit, credit, currency, detail?
    // Removed: amount, type (excess properties that would break tsc)
    const debitEntries = allocation.allocations.map(a => ({
      accountNumber: '642',
      accountName: 'Chi phí quản lý',
      debit: a.allocatedAmount,
      credit: 0,
      currency: 'VND',
      detail: `PB ${allocation.costType} - ${a.costCenter}`
    }));

    const creditEntry = {
      accountNumber: '242',
      accountName: 'Chi phí trả trước',
      debit: 0,
      credit: allocation.totalAmount,
      currency: 'VND',
      detail: `Phân bổ ${allocation.costType} kỳ này`
    };

    return {
      journalId: `JRN-ALLOC-${allocation.costId}`,
      transactionDate: new Date(allocation.allocationDate),
      description: `Bút toán phân bổ chi phí ${allocation.costType}`,
      journalType: 'ALLOCATION',
      status: 'DRAFT',
      entries: [...debitEntries, creditEntry],
      // FIX: reference is REQUIRED in goldmaster AccountingEntry
      reference: {
        costId: allocation.costId,
        costType: allocation.costType,
        method: allocation.allocationMethod
      },
      matchScore: 100,
      createdAt: new Date()
    };
  }
}
'''
    write_file(
        "src/services/cost/CostAllocationSystem.ts",
        content,
        "CostAllocationSystem"
    )


# ═══════════════════════════════════════════════════════════════
# MODULE 7: authService (181L) — 13 UserRole ENUM REWRITES
# Goldmaster: user_role.master, .admin, .level_1, ...
# Nattcell:   UserRole.MASTER, .ADMIN, .LEVEL_1, ...
# ═══════════════════════════════════════════════════════════════
def module_7_auth():
    print("\n[7] authService")
    content = '''\
import { UserRole, Permission, ModuleID, RolePermissions } from '../types';

/**
 * NATT-OS AUTHENTICATION & RBAC ENGINE
 * Quản lý ma trận quyền hạn dựa trên Identity Role.
 * Source: NATTCELL KERNEL
 * FIX: UserRole enum keys rewritten (MASTER→master, ADMIN→admin, etc.)
 */
export class AuthService {
  private static instance: AuthService;

  private getFullPermissions(): Permission[] {
    return [Permission.VIEW, Permission.CREATE, Permission.EDIT, Permission.DELETE, Permission.APPROVE, Permission.SIGN, Permission.EXPORT];
  }

  private getViewPermissions(): Permission[] {
    return [Permission.VIEW, Permission.EXPORT];
  }

  private getOperatorPermissions(): Permission[] {
    return [Permission.VIEW, Permission.CREATE, Permission.EDIT];
  }

  // Ma trận quyền mặc định — FIX: lowercase enum keys
  private readonly matrix: Record<UserRole, RolePermissions> = {
    [UserRole.master]: {
      [ModuleID.PRODUCTION]: this.getFullPermissions(),
      [ModuleID.SALES]: this.getFullPermissions(),
      [ModuleID.FINANCE]: this.getFullPermissions(),
      [ModuleID.LEGAL]: this.getFullPermissions(),
      [ModuleID.HR]: this.getFullPermissions(),
      [ModuleID.REPORTING]: this.getFullPermissions(),
      [ModuleID.INVENTORY]: this.getFullPermissions()
    },
    [UserRole.admin]: {
      [ModuleID.PRODUCTION]: this.getFullPermissions(),
      [ModuleID.SALES]: this.getFullPermissions(),
      [ModuleID.FINANCE]: this.getFullPermissions(),
      [ModuleID.LEGAL]: this.getFullPermissions(),
      [ModuleID.HR]: this.getFullPermissions(),
      [ModuleID.REPORTING]: this.getFullPermissions(),
      [ModuleID.INVENTORY]: this.getFullPermissions()
    },
    [UserRole.level_1]: {
      [ModuleID.PRODUCTION]: this.getFullPermissions(),
      [ModuleID.SALES]: this.getFullPermissions(),
      [ModuleID.FINANCE]: this.getFullPermissions(),
      [ModuleID.LEGAL]: this.getFullPermissions(),
      [ModuleID.HR]: this.getFullPermissions(),
      [ModuleID.REPORTING]: this.getFullPermissions(),
      [ModuleID.INVENTORY]: this.getFullPermissions()
    },
    [UserRole.level_2]: {
      [ModuleID.PRODUCTION]: [Permission.VIEW, Permission.EDIT, Permission.APPROVE],
      [ModuleID.SALES]: [Permission.VIEW, Permission.EDIT, Permission.APPROVE],
      [ModuleID.FINANCE]: [Permission.VIEW, Permission.APPROVE],
      [ModuleID.LEGAL]: [Permission.VIEW, Permission.APPROVE],
      [ModuleID.HR]: [Permission.VIEW, Permission.APPROVE],
      [ModuleID.REPORTING]: [Permission.VIEW, Permission.EXPORT],
      [ModuleID.INVENTORY]: [Permission.VIEW, Permission.APPROVE]
    },
    [UserRole.level_3]: {
      [ModuleID.PRODUCTION]: this.getOperatorPermissions(),
      [ModuleID.SALES]: this.getOperatorPermissions(),
      [ModuleID.FINANCE]: [Permission.VIEW],
      [ModuleID.LEGAL]: [Permission.VIEW],
      [ModuleID.HR]: [Permission.VIEW],
      [ModuleID.REPORTING]: [Permission.VIEW],
      [ModuleID.INVENTORY]: this.getOperatorPermissions()
    },
    [UserRole.level_4]: {
      [ModuleID.PRODUCTION]: this.getOperatorPermissions(),
      [ModuleID.SALES]: this.getOperatorPermissions(),
      [ModuleID.FINANCE]: [Permission.VIEW],
      [ModuleID.LEGAL]: [Permission.VIEW],
      [ModuleID.HR]: [Permission.VIEW],
      [ModuleID.REPORTING]: [Permission.VIEW],
      [ModuleID.INVENTORY]: this.getOperatorPermissions()
    },
    [UserRole.level_5]: {
      [ModuleID.PRODUCTION]: this.getOperatorPermissions(),
      [ModuleID.SALES]: this.getOperatorPermissions(),
      [ModuleID.FINANCE]: [Permission.VIEW],
      [ModuleID.LEGAL]: [Permission.VIEW],
      [ModuleID.HR]: [Permission.VIEW],
      [ModuleID.REPORTING]: [Permission.VIEW],
      [ModuleID.INVENTORY]: this.getOperatorPermissions()
    },
    [UserRole.level_6]: {
      [ModuleID.PRODUCTION]: [Permission.VIEW],
      [ModuleID.SALES]: [],
      [ModuleID.FINANCE]: [],
      [ModuleID.LEGAL]: [],
      [ModuleID.HR]: [Permission.VIEW],
      [ModuleID.REPORTING]: [],
      [ModuleID.INVENTORY]: [Permission.VIEW]
    },
    [UserRole.level_7]: {
      [ModuleID.PRODUCTION]: [],
      [ModuleID.SALES]: [Permission.VIEW, Permission.CREATE],
      [ModuleID.FINANCE]: [],
      [ModuleID.LEGAL]: [],
      [ModuleID.HR]: [],
      [ModuleID.REPORTING]: [],
      [ModuleID.INVENTORY]: [Permission.VIEW]
    },
    [UserRole.level_8]: {
      [ModuleID.PRODUCTION]: this.getViewPermissions(),
      [ModuleID.SALES]: this.getViewPermissions(),
      [ModuleID.FINANCE]: this.getViewPermissions(),
      [ModuleID.LEGAL]: this.getViewPermissions(),
      [ModuleID.HR]: this.getViewPermissions(),
      [ModuleID.REPORTING]: this.getFullPermissions(),
      [ModuleID.INVENTORY]: this.getViewPermissions()
    },
    [UserRole.signer]: {
      [ModuleID.PRODUCTION]: [Permission.VIEW],
      [ModuleID.SALES]: [Permission.VIEW],
      [ModuleID.FINANCE]: [Permission.VIEW, Permission.APPROVE, Permission.SIGN, Permission.EXPORT],
      [ModuleID.LEGAL]: [Permission.VIEW, Permission.APPROVE, Permission.SIGN, Permission.EXPORT],
      [ModuleID.HR]: [Permission.VIEW],
      [ModuleID.REPORTING]: [Permission.VIEW, Permission.EXPORT],
      [ModuleID.INVENTORY]: [Permission.VIEW, Permission.EXPORT]
    },
    [UserRole.approver]: {
      [ModuleID.PRODUCTION]: [Permission.VIEW, Permission.EDIT, Permission.APPROVE],
      [ModuleID.SALES]: [Permission.VIEW, Permission.EDIT, Permission.APPROVE],
      [ModuleID.FINANCE]: [Permission.VIEW],
      [ModuleID.LEGAL]: [Permission.VIEW],
      [ModuleID.HR]: [Permission.VIEW, Permission.APPROVE],
      [ModuleID.REPORTING]: [Permission.VIEW, Permission.EXPORT],
      [ModuleID.INVENTORY]: [Permission.VIEW, Permission.APPROVE]
    },
    [UserRole.operator]: {
      [ModuleID.PRODUCTION]: [Permission.VIEW, Permission.CREATE, Permission.EDIT],
      [ModuleID.SALES]: [Permission.VIEW, Permission.CREATE, Permission.EDIT],
      [ModuleID.FINANCE]: [Permission.VIEW],
      [ModuleID.LEGAL]: [Permission.VIEW],
      [ModuleID.HR]: [Permission.VIEW],
      [ModuleID.REPORTING]: [Permission.VIEW],
      [ModuleID.INVENTORY]: [Permission.VIEW, Permission.CREATE]
    }
  };

  public static getInstance() {
    if (!AuthService.instance) AuthService.instance = new AuthService();
    return AuthService.instance;
  }

  public hasPermission(role: UserRole, module: ModuleID, action: Permission): boolean {
    const rolePerms = this.matrix[role];
    if (!rolePerms) return false;
    const permissions = rolePerms[module];
    return permissions ? permissions.includes(action) : false;
  }

  public getPermissions(role: UserRole): RolePermissions {
    return this.matrix[role] || {
      [ModuleID.FINANCE]: [],
      [ModuleID.PRODUCTION]: [],
      [ModuleID.INVENTORY]: [],
      [ModuleID.SALES]: [],
      [ModuleID.LEGAL]: [],
      [ModuleID.HR]: [],
      [ModuleID.REPORTING]: []
    };
  }
}

export const RBACGuard = AuthService.getInstance();
'''
    write_file(
        "src/services/authService.ts",
        content,
        "authService"
    )


# ═══════════════════════════════════════════════════════════════
# MODULE 8: personnelEngine (108L)
# FIX: Department.FINANCE→.finance, .SALES→.sales, .PRODUCTION→.production, .IT→.it
# FIX: UserRole.LEVEL_1→.level_1, .LEVEL_2→.level_2, .LEVEL_5→.level_5, .LEVEL_6→.level_6
# ═══════════════════════════════════════════════════════════════
def module_8_personnel():
    print("\n[8] personnelEngine")
    content = '''\
import { PositionType, UserRole, PersonnelProfile, Department } from '../types';

/**
 * 👤 PERSONNEL ENGINE
 * Quản lý hồ sơ nhân sự & KPI.
 * Source: NATTCELL KERNEL
 * FIX: Department enum (FINANCE→finance), UserRole enum (LEVEL_1→level_1)
 */
export class PersonnelEngine {
  private static profiles: Record<string, PersonnelProfile> = {
    [PositionType.CFO]: {
      fullName: 'Master NATT',
      employeeCode: 'TL-M001',
      position: { id: 'pos-1', role: PositionType.CFO, department: Department.finance, scope: ['ALL'] },
      role: UserRole.level_1,
      startDate: '2020-01-01',
      kpiPoints: 9999,
      tasksCompleted: 450,
      lastRating: 'MASTER',
      bio: 'Kiểm toán độc lập, Tổng tham mưu chiến lược toàn hệ sinh thái.'
    },
    [PositionType.GENERAL_MANAGER]: {
      fullName: 'Nguyễn Minh Hiếu',
      employeeCode: 'TL-M002',
      position: { id: 'pos-gm', role: PositionType.GENERAL_MANAGER, department: Department.sales, scope: ['ALL'] },
      role: UserRole.level_1,
      startDate: '2020-05-12',
      kpiPoints: 850,
      tasksCompleted: 120,
      lastRating: 'EXCELLENT',
      bio: 'Quản lý điều hành chung, chịu trách nhiệm vận hành hệ thống.'
    },
    [PositionType.PROD_DIRECTOR]: {
      fullName: 'Trần Văn Hòa',
      employeeCode: 'TL-M003',
      position: { id: 'pos-pd', role: PositionType.PROD_DIRECTOR, department: Department.production, scope: ['ALL'] },
      role: UserRole.level_1,
      startDate: '2021-02-10',
      kpiPoints: 920,
      tasksCompleted: 85,
      lastRating: 'EXCELLENT',
      bio: 'Giám đốc sản xuất, chuyên gia kỹ thuật kim hoàn.'
    },
    [PositionType.ACCOUNTING_MANAGER]: {
      fullName: 'Nguyễn Thị Mi',
      employeeCode: 'TL-H001',
      position: { id: 'pos-am', role: PositionType.ACCOUNTING_MANAGER, department: Department.finance, scope: ['FINANCE'] },
      role: UserRole.level_2,
      startDate: '2021-06-20',
      kpiPoints: 780,
      tasksCompleted: 240,
      lastRating: 'OPTIMAL',
      bio: 'Quản lý tài chính kế toán, kiểm soát dòng tiền.'
    },
    [PositionType.CASTING_MANAGER]: {
      fullName: 'Trần Anh Tuấn',
      employeeCode: 'TL-H002',
      position: { id: 'pos-cm', role: PositionType.CASTING_MANAGER, department: Department.production, scope: ['CASTING'] },
      role: UserRole.level_2,
      startDate: '2022-01-15',
      kpiPoints: 650,
      tasksCompleted: 95,
      lastRating: 'GOOD',
      bio: 'Quản lý phân xưởng đúc, tối ưu quy trình đúc.'
    },
    [PositionType.ROUGH_FINISHER]: {
      fullName: 'Nguyễn Văn Vẹn',
      employeeCode: 'TL-W045',
      position: { id: 'pos-rf', role: PositionType.ROUGH_FINISHER, department: Department.production, scope: ['COLDWORK'] },
      role: UserRole.level_6,
      startDate: '2023-04-10',
      kpiPoints: 420,
      tasksCompleted: 58,
      lastRating: 'STABLE',
      bio: 'Thợ nguội, chuyên xử lý bề mặt sản phẩm thô.'
    }
  };

  static getProfileByPosition(role: string): PersonnelProfile {
    return this.profiles[role] || {
      fullName: 'Nhân viên Tâm Luxury',
      employeeCode: 'TL-X999',
      position: { id: 'pos-unknown', role: role as PositionType, department: Department.it, scope: [] },
      role: UserRole.level_5,
      startDate: '2024-01-01',
      kpiPoints: 0,
      tasksCompleted: 0,
      lastRating: 'NEW',
      bio: 'Hồ sơ nhân sự chưa cập nhật.'
    };
  }

  static trackKPI(role: string, actionType: string): number {
    const profile = this.profiles[role];
    if (!profile) return 0;

    let points = 5;
    if (actionType === 'SIGN') points = 50;
    if (actionType === 'APPROVE') points = 20;
    if (actionType === 'PRODUCTION_STEP') points = 15;

    profile.kpiPoints += points;
    profile.tasksCompleted += 1;
    return points;
  }
}
'''
    write_file(
        "src/services/personnelEngine.ts",
        content,
        "personnelEngine"
    )


# ═══════════════════════════════════════════════════════════════
# BONUS: hrEngine (107L)
# FIX: UserRole.MASTER→.master, .LEVEL_1→.level_1, etc.
# ═══════════════════════════════════════════════════════════════
def module_9_hr_engine():
    print("\n[9] hrEngine (bonus)")
    content = '''\
import { EmployeePayroll, SalaryRule, UserRole } from '../types';

/**
 * 👷 HR ENGINE
 * Validation, field-level security, payroll calculation.
 * Source: NATTCELL KERNEL
 * FIX: UserRole enum keys (MASTER→master, LEVEL_x→level_x)
 */
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
      .normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")
      .replace(/đ/g, "d");
  }

  static validateCCCD(cccd: string): boolean {
    return /^\\d{12}$/.test(cccd);
  }

  static validateTaxID(taxId: string): boolean {
    return /^\\d{10}(\\d{3})?$/.test(taxId);
  }

  static validatePhone(phone: string): boolean {
    return /^(0|84)(3|5|7|8|9)([0-9]{8})$/.test(phone);
  }

  /**
   * 🛡️ FIELD-LEVEL SECURITY
   */
  static checkPermission(role: UserRole, field: string): boolean {
    // FIX: lowercase enum keys
    if ([UserRole.master, UserRole.level_1, UserRole.level_8].includes(role)) return true;

    if (role === UserRole.level_2 || role === UserRole.level_3) {
      return HR_FIELDS_LEVELS.BASIC.includes(field) || HR_FIELDS_LEVELS.WORK.includes(field);
    }

    if (role === UserRole.level_5) {
      return HR_FIELDS_LEVELS.FINANCE.includes(field) || HR_FIELDS_LEVELS.INSURANCE.includes(field);
    }

    return HR_FIELDS_LEVELS.BASIC.includes(field);
  }

  static calculateSeniority(startDateStr: string): string {
    if (!startDateStr) return "N/A";
    const start = new Date(startDateStr);
    const now = new Date();
    if (isNaN(start.getTime())) return "Dữ liệu lỗi";

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return years > 0 ? `${years} năm, ${months} tháng` : `${months} tháng`;
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

    // Thuế TNCN lũy tiến 2025
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
'''
    write_file(
        "src/services/hrEngine.ts",
        content,
        "hrEngine"
    )


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
def main():
    print("=" * 60)
    print("NATTCELL → GOLDMASTER MERGE — BATCH B")
    print("4 modules, ~484L real code")
    print("=" * 60)

    if not os.path.isdir(GM):
        print(f"\n❌ Goldmaster not found: {GM}")
        sys.exit(1)

    if DRY_RUN:
        print("\n🔍 DRY RUN — no files will be written\n")

    module_6_cost_allocation()
    module_7_auth()
    module_8_personnel()
    module_9_hr_engine()

    print("\n" + "=" * 60)
    print("BATCH B COMPLETE")
    print("=" * 60)
    print("\nVerify:")
    print("  cd goldmaster && npx tsc --noEmit 2>&1 | head -20")
    print("  npm run build")
    print()
    print("If clean → run batch_c_merge.py")
    print("If errors → check enum casing alignment")


if __name__ == "__main__":
    main()
