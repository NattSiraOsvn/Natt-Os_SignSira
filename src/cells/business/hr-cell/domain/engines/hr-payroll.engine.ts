/**
 * hr-cell/domain/engines/hr-payroll.engine.ts
 * Wave 3 — Lương, BHXH, TNCN lũy tiến, thâm niên
 * Nguồn: File 16 HR GAS (Tâm Luxury Payroll System)
 * Điều 9 Hiến Pháp: KHÔNG import SmartLink/EventBus — engine thuần nghiệp vụ
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const PAYROLL_CONSTANTS = {
  /** Ngày công chuẩn tháng */
  STANDARD_WORK_DAYS: 26,
  /** NV đóng: 8% BHXH + 1.5% BHYT + 1% BHTN */
  EMPLOYEE_INS_RATE: 0.105,
  /** Công ty đóng: 17.5% BHXH + 3% BHYT + 1% BHTN = 21.5% */
  EMPLOYER_INS_RATE: 0.215,
  /** Giảm trừ bản thân 2024 */
  PERSONAL_DEDUCTION: 11_000_000,
  /** Giảm trừ người phụ thuộc */
  DEPENDENT_DEDUCTION: 4_400_000,
  /** Miễn thuế tiền cơm tối đa */
  MEAL_ALLOWANCE_EXEMPT: 730_000,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PayrollInput {
  employeeId: string;
  fullName: string;
  contractSalary: number;      // Lương HĐ (gross)
  insuranceSalary?: number;    // Mức đóng BH (nếu khác lương HĐ)
  actualWorkDays: number;      // Ngày công thực tế
  mealAllowance?: number;      // Phụ cấp cơm
  dependents?: number;         // Số người phụ thuộc
  startDate?: string | Date;   // Ngày vào làm (tính thâm niên)
  block?: string;              // Khối (SX/VP/BH)
  position?: string;           // Chức vụ
}

export interface PayrollResult {
  employeeId: string;
  fullName: string;
  grossSalary: number;         // Lương tính theo ngày công
  insuranceEmployee: number;   // BHXH/BHYT/BHTN NV đóng 10.5%
  insuranceEmployer: number;   // BHXH/BHYT/BHTN Công ty đóng 21.5%
  taxableIncome: number;       // Thu nhập chịu thuế
  pit: number;                 // Thuế TNCN
  netSalary: number;           // Thực lĩnh
  seniority?: string;          // Thâm niên dạng "X năm Y tháng Z ngày"
}

export interface SalaryGrade {
  salary: number;
  grade: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * cleanMoney — parse số tiền từ bất kỳ định dạng VN nào.
 * Chỉ giữ chữ số, không xử lý decimal (tiền VN thường nguyên).
 */
export function cleanMoney(val: unknown): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const str = String(val).replace(/[^0-9]/g, '');
  return str ? parseInt(str, 10) : 0;
}

/** parseNumber an toàn */
export function parseNumber(val: unknown): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const res = parseFloat(String(val));
  return isNaN(res) ? 0 : res;
}

/**
 * parseDateSafe — parse ngày từ string dd/MM/yyyy hoặc Date object.
 * Trả null nếu không parse được.
 */
export function parseDateSafe(input: unknown): Date | null {
  if (input instanceof Date) return input;
  if (!input) return null;
  const str = String(input).trim();
  const parts = str.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    let y = parseInt(parts[2], 10);
    if (y < 100) y += 2000;
    const dt = new Date(y, m - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(str);
  return isNaN(dt.getTime()) ? null : dt;
}

/**
 * normalizeText — lowercase + bỏ dấu tiếng Việt.
 * Dùng để so sánh tên cột/khối/chức vụ không phân biệt dấu.
 */
export function normalizeText(str: unknown): string {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim();
}

/** normalizeTextHeader — bỏ dấu + bỏ khoảng trắng → key so sánh header */
export function normalizeTextHeader(str: unknown): string {
  return normalizeText(str).replace(/\s/g, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE ENGINES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * calcTNCN — Thuế TNCN lũy tiến 7 bậc (biểu thuế VN 2024).
 * Input: thu nhập tính thuế (sau giảm trừ).
 * Output: thuế phải nộp.
 *
 * Công thức rút gọn (tránh tính từng bậc):
 *   Bậc 1: ≤5tr   → 5%
 *   Bậc 2: ≤10tr  → 10% - 250k
 *   Bậc 3: ≤18tr  → 15% - 750k
 *   Bậc 4: ≤32tr  → 20% - 1.65tr
 *   Bậc 5: ≤52tr  → 25% - 3.25tr
 *   Bậc 6: ≤80tr  → 30% - 5.85tr
 *   Bậc 7: >80tr  → 35% - 9.85tr
 */
export function calcTNCN(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 5_000_000)  return taxableIncome * 0.05;
  if (taxableIncome <= 10_000_000) return taxableIncome * 0.10 - 250_000;
  if (taxableIncome <= 18_000_000) return taxableIncome * 0.15 - 750_000;
  if (taxableIncome <= 32_000_000) return taxableIncome * 0.20 - 1_650_000;
  if (taxableIncome <= 52_000_000) return taxableIncome * 0.25 - 3_250_000;
  if (taxableIncome <= 80_000_000) return taxableIncome * 0.30 - 5_850_000;
  return taxableIncome * 0.35 - 9_850_000;
}

/**
 * calcPayroll — tính lương đầy đủ: gross → BHXH → TNCN → net.
 *
 * Luồng:
 *   1. Lương gross = (contractSalary / 26) × actualWorkDays
 *   2. BHXH NV = insuranceSalary × 10.5%
 *   3. BHXH CTY = insuranceSalary × 21.5%
 *   4. Thu nhập chịu thuế = gross + mealAllowance - phần cơm miễn thuế
 *   5. Thu nhập tính thuế = TNCT - BHXH NV - giảm trừ bản thân - giảm trừ NPT
 *   6. TNCN = calcTNCN(TNTT)
 *   7. Net = gross + mealAllowance - BHXH NV - TNCN
 */
export function calcPayroll(input: PayrollInput): PayrollResult {
  const insSalary = input.insuranceSalary || input.contractSalary;
  const meal = input.mealAllowance || 0;
  const deps = input.dependents || 0;

  const grossSalary = Math.round(
    (input.contractSalary / PAYROLL_CONSTANTS.STANDARD_WORK_DAYS) * input.actualWorkDays
  );

  const insuranceEmployee = Math.round(insSalary * PAYROLL_CONSTANTS.EMPLOYEE_INS_RATE);
  const insuranceEmployer = Math.round(insSalary * PAYROLL_CONSTANTS.EMPLOYER_INS_RATE);

  const mealExempt = Math.min(meal, PAYROLL_CONSTANTS.MEAL_ALLOWANCE_EXEMPT);
  const taxableIncome = grossSalary + meal - mealExempt;

  const totalDeductions = insuranceEmployee
    + PAYROLL_CONSTANTS.PERSONAL_DEDUCTION
    + deps * PAYROLL_CONSTANTS.DEPENDENT_DEDUCTION;

  const incomeForTax = Math.max(0, taxableIncome - totalDeductions);
  const pit = Math.round(calcTNCN(incomeForTax));

  const netSalary = Math.round(grossSalary + meal - insuranceEmployee - pit);

  const seniority = input.startDate
    ? calcSeniority(input.startDate)
    : undefined;

  return {
    employeeId: input.employeeId,
    fullName: input.fullName,
    grossSalary,
    insuranceEmployee,
    insuranceEmployer,
    taxableIncome,
    pit,
    netSalary,
    seniority,
  };
}

/**
 * findClosestSalaryGrade — tìm bậc lương gần nhất với mức lương thực tế.
 * Sort rules tăng dần → tìm diff nhỏ nhất.
 */
export function findClosestSalaryGrade(
  actualSalary: number,
  rules: SalaryGrade[],
): string {
  if (!rules || rules.length === 0) return 'Chưa định nghĩa';
  const sorted = [...rules].sort((a, b) => a.salary - b.salary);
  let closest = sorted[0].grade;
  let minDiff = Math.abs(actualSalary - sorted[0].salary);
  for (const item of sorted) {
    const diff = Math.abs(actualSalary - item.salary);
    if (diff === 0) return item.grade;
    if (diff < minDiff) { minDiff = diff; closest = item.grade; }
  }
  return closest;
}

/**
 * calcSeniority — tính thâm niên từ ngày vào làm đến hôm nay.
 * Output: "X năm, Y tháng, Z ngày"
 */
export function calcSeniority(startDate: string | Date, endDate?: Date): string {
  const start = startDate instanceof Date ? startDate : parseDateSafe(startDate);
  if (!start) return 'Lỗi dữ liệu ngày';
  const end = endDate || new Date();
  return getDateDiffString(start, end);
}

/**
 * getDateDiffString — format khoảng cách 2 ngày thành chuỗi dễ đọc.
 */
export function getDateDiffString(startDate: Date, endDate: Date): string {
  let years  = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth()    - startDate.getMonth();
  let days   = endDate.getDate()     - startDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) { years--; months += 12; }
  return `${years} năm, ${months} tháng, ${days} ngày`;
}

/**
 * detectColumns — AI column detection 4 phương pháp.
 * Trả về map { normalizedKey: columnIndex } từ header row.
 *
 * Method 1: exact match (normalized)
 * Method 2: contains match
 * Method 3: starts-with match
 * Method 4: abbreviation match
 */
export function detectColumns(
  headers: unknown[],
  targetKeys: string[],
): Record<string, number> {
  const result: Record<string, number> = {};
  const normHeaders = headers.map(h => normalizeTextHeader(h));

  for (const key of targetKeys) {
    const normKey = normalizeTextHeader(key);
    let found = -1;

    // M1: exact
    found = normHeaders.indexOf(normKey);
    if (found !== -1) { result[normKey] = found; continue; }

    // M2: contains
    found = normHeaders.findIndex(h => h.includes(normKey));
    if (found !== -1) { result[normKey] = found; continue; }

    // M3: starts-with
    found = normHeaders.findIndex(h => h.startsWith(normKey.substring(0, 4)));
    if (found !== -1) { result[normKey] = found; continue; }

    // M4: abbreviation (first char of each word)
    const abbr = normKey.split(/\s+/).map(w => w[0]).join('');
    found = normHeaders.findIndex(h => h === abbr);
    if (found !== -1) result[normKey] = found;
  }
  return result;
}
