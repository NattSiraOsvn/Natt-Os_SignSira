/**
 * Natt-OS HR Payroll Engine v1.0
 * Port từ Doc 12 — Quản Trị Nhân Sự Tâm Luxury
 *
 * 3 modules: bậc lương + tính lương full + thâm niên
 * Target: hr-cell
 */

// ── SALARY GRADE RULE ─────────────────────────────────────────────────────
export interface SalaryRule {
  salary: number;
  grade:  string;
}

/**
 * Tìm bậc lương gần nhất với mức lương thực tế
 * Port từ Doc 12 findClosestSalaryGrade()
 * VD: thực tế 12.5tr, bảng có [10tr/Bậc1, 13tr/Bậc2, 16tr/Bậc3] → Bậc 2
 */
export function findClosestSalaryGrade(
  actualSalary: number,
  rules: SalaryRule[],
): string {
  if (!rules || rules.length === 0) return 'Chưa định nghĩa';
  const sorted = [...rules].sort((a, b) => a.salary - b.salary);

  let closest = sorted[0].grade;
  let minDiff  = Math.abs(actualSalary - sorted[0].salary);

  for (const rule of sorted) {
    const diff = Math.abs(actualSalary - rule.salary);
    if (diff === 0)      return rule.grade; // exact match
    if (diff < minDiff) { minDiff = diff; closest = rule.grade; }
  }
  return closest;
}

// ── TNCN LŨY TIẾN ────────────────────────────────────────────────────────
/**
 * Tính thuế TNCN theo biểu lũy tiến 7 bậc (2024-2025)
 * Port từ Doc 12 calculateTNCN_Progressive()
 *
 * Bậc 1: ≤5tr      → 5%
 * Bậc 2: 5-10tr    → 10% - 250k
 * Bậc 3: 10-18tr   → 15% - 750k
 * Bậc 4: 18-32tr   → 20% - 1.65tr
 * Bậc 5: 32-52tr   → 25% - 3.25tr
 * Bậc 6: 52-80tr   → 30% - 5.85tr
 * Bậc 7: >80tr     → 35% - 9.85tr
 */
export function calcTNCN(taxableIncome: number): number {
  if (taxableIncome <= 0)          return 0;
  if (taxableIncome <= 5_000_000)  return taxableIncome * 0.05;
  if (taxableIncome <= 10_000_000) return taxableIncome * 0.10 - 250_000;
  if (taxableIncome <= 18_000_000) return taxableIncome * 0.15 - 750_000;
  if (taxableIncome <= 32_000_000) return taxableIncome * 0.20 - 1_650_000;
  if (taxableIncome <= 52_000_000) return taxableIncome * 0.25 - 3_250_000;
  if (taxableIncome <= 80_000_000) return taxableIncome * 0.30 - 5_850_000;
  return taxableIncome * 0.35 - 9_850_000;
}

// ── PAYROLL CONSTANTS (2024-2025) ─────────────────────────────────────────
export const PAYROLL_CONSTANTS = {
  WORKING_DAYS_STD: 26,        // ngày công chuẩn/tháng
  BHXH_NV_RATE:     0.105,     // NV đóng 10.5%: BHXH 8% + BHYT 1.5% + BHTN 1%
  BHXH_CTY_RATE:    0.215,     // CTY đóng 21.5%: BHXH 17.5% + BHYT 3% + BHTN 1%
  GIAM_TRU_BT:      11_000_000, // giảm trừ bản thân 11tr/tháng
  GIAM_TRU_NPT:     4_400_000,  // giảm trừ người phụ thuộc 4.4tr/người
  COM_MIEN_THUE:    730_000,    // cơm trưa miễn thuế tối đa 730k/tháng
} as const;

// ── PAYROLL RESULT ────────────────────────────────────────────────────────
export interface PayrollResult {
  luongGross:        number;  // lương ngày công thực
  bhxhNV:            number;  // NV đóng 10.5%
  bhxhCTY:           number;  // CTY đóng 21.5%
  thuNhapChiuThue:   number;
  thuNhapTinhThue:   number;
  tncn:              number;
  thucLinh:          number;  // net
  breakdown: {
    luongHD:   number;
    ngayCong:  number;
    pcCom:     number;
    luongBH:   number;
    soNPT:     number;
  };
}

/**
 * Tính lương đầy đủ: Gross → BHXH → TNCN → Net
 * Port từ Doc 12 calculatePayroll_Full()
 */
export function calcPayroll(params: {
  luongHD:    number;  // lương hợp đồng
  ngayCong:   number;  // ngày công thực
  luongBH?:   number;  // mức lương đóng BHXH (mặc định = luongHD)
  pcCom?:     number;  // phụ cấp cơm
  soNPT?:     number;  // số người phụ thuộc
}): PayrollResult {
  const {
    luongHD,
    ngayCong,
    luongBH    = luongHD,
    pcCom      = 0,
    soNPT      = 0,
  } = params;

  const c = PAYROLL_CONSTANTS;

  // 1. Lương theo ngày công
  const luongGross = (luongHD / c.WORKING_DAYS_STD) * ngayCong;

  // 2. BHXH
  const bhxhNV  = luongBH * c.BHXH_NV_RATE;
  const bhxhCTY = luongBH * c.BHXH_CTY_RATE;

  // 3. TNCN
  const comMienThue      = Math.min(pcCom, c.COM_MIEN_THUE);
  const thuNhapChiuThue  = luongGross + pcCom - comMienThue;
  const giamTru          = bhxhNV + c.GIAM_TRU_BT + soNPT * c.GIAM_TRU_NPT;
  const thuNhapTinhThue  = Math.max(0, thuNhapChiuThue - giamTru);
  const tncn             = calcTNCN(thuNhapTinhThue);

  // 4. Thực lĩnh
  const thucLinh = luongGross + pcCom - bhxhNV - tncn;

  return {
    luongGross:       Math.round(luongGross),
    bhxhNV:           Math.round(bhxhNV),
    bhxhCTY:          Math.round(bhxhCTY),
    thuNhapChiuThue:  Math.round(thuNhapChiuThue),
    thuNhapTinhThue:  Math.round(thuNhapTinhThue),
    tncn:             Math.round(tncn),
    thucLinh:         Math.round(thucLinh),
    breakdown: { luongHD, ngayCong, pcCom, luongBH, soNPT },
  };
}

// ── THÂM NIÊN ─────────────────────────────────────────────────────────────
/**
 * Tính thâm niên chính xác — port từ Doc 12 getDateDiffString()
 * Xử lý carry: ngày âm → borrow tháng, tháng âm → borrow năm
 */
export function calcSeniority(startDate: Date, endDate = new Date()): {
  years:   number;
  months:  number;
  days:    number;
  display: string;
} {
  let years  = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth()    - startDate.getMonth();
  let days   = endDate.getDate()     - startDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const display = `${years} năm, ${months} tháng, ${days} ngày`;
  return { years, months, days, display };
}

/**
 * Parse date an toàn từ nhiều định dạng
 * Port từ Doc 12 parseDate()
 * Hỗ trợ: Date object, 'dd/MM/yyyy', 'yyyy-MM-dd', timestamp
 */
export function parseDateSafe(input: unknown): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  const s = String(input).trim();

  // dd/MM/yyyy hoặc dd-MM-yyyy
  const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    const year = parseInt(y) < 100 ? 2000 + parseInt(y) : parseInt(y);
    return new Date(year, parseInt(m) - 1, parseInt(d));
  }

  // yyyy-MM-dd (ISO)
  const isoMatch = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // Fallback
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// ── AI COLUMN DETECTOR (4-method weighted) ────────────────────────────────
/**
 * Phát hiện cột SĐT và mã đơn tự động — port từ Doc 7/8
 * 4 phương pháp: header(0.4) + pattern(0.3) + content(0.2) + frequency(0.1)
 */
export interface ColumnScore {
  phoneScore: number;
  keyScore:   number;
  dateScore:  number;
  sampleSize: number;
}

const PHONE_RE = /^(0|84|\+84)(3|5|7|8|9)\d{8}$/;
const KEY_RE   = /^[A-Z0-9\-\._]{5,30}$/i;
const DATE_RE  = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/;

const PHONE_KW = ['PHONE','SĐT','TEL','MOBILE','ĐIỆN THOẠI','DIENTHOAI','CONTACT','SỐ ĐIỆN THOẠI'];
const KEY_KW   = ['MÃ','CODE','VẬN ĐƠN','BILL','ORDER','ID','REFERENCE','TRACKING'];
const DATE_KW  = ['DATE','NGÀY','TIME','THỜI GIAN'];

export const COLUMN_CONFIDENCE = { PHONE: 0.65, KEY: 0.7, HEADER: 0.8 };

export function scoreColumnByHeader(header: string): ColumnScore {
  const h = header.toUpperCase();
  return {
    phoneScore: PHONE_KW.some(k => h.includes(k)) ? 0.8 : 0,
    keyScore:   KEY_KW.some(k => h.includes(k))   ? 0.8 : 0,
    dateScore:  DATE_KW.some(k => h.includes(k))  ? 0.7 : 0,
    sampleSize: 0,
  };
}

export function scoreColumnByPattern(values: unknown[]): ColumnScore {
  let phoneMatches = 0, keyMatches = 0, dateMatches = 0, valid = 0;
  for (const v of values.slice(0, 50)) {
    if (v === null || v === undefined || v === '') continue;
    const s = String(v).trim(); valid++;
    const clean = s.replace(/[^0-9+]/g, '');
    if (PHONE_RE.test(clean))   phoneMatches++;
    if (KEY_RE.test(s))         keyMatches++;
    if (DATE_RE.test(s))        dateMatches++;
  }
  return {
    phoneScore: valid > 0 ? phoneMatches / valid : 0,
    keyScore:   valid > 0 ? keyMatches   / valid : 0,
    dateScore:  valid > 0 ? dateMatches  / valid : 0,
    sampleSize: valid,
  };
}

export function scoreColumnByFrequency(values: unknown[]): ColumnScore {
  const seen = new Set<string>();
  let total = 0;
  for (const v of values.slice(0, 200)) {
    if (v === null || v === undefined || v === '') continue;
    seen.add(String(v).trim()); total++;
  }
  const uniqueness = total > 0 ? seen.size / total : 0;
  return {
    phoneScore: Math.max(0, 1 - uniqueness * 0.8), // phone có thể repeat
    keyScore:   uniqueness * 0.7,                   // key phải unique
    dateScore:  0,
    sampleSize: total,
  };
}

export function aggregateColumnScores(
  headerScore:    ColumnScore,
  patternScore:   ColumnScore,
  contentScore:   ColumnScore,
  frequencyScore: ColumnScore,
): ColumnScore {
  const weights = [0.4, 0.3, 0.2, 0.1];
  const all = [headerScore, patternScore, contentScore, frequencyScore];
  return {
    phoneScore: all.reduce((s, c, i) => s + c.phoneScore * weights[i], 0),
    keyScore:   all.reduce((s, c, i) => s + c.keyScore   * weights[i], 0),
    dateScore:  all.reduce((s, c, i) => s + c.dateScore  * weights[i], 0),
    sampleSize: Math.max(...all.map(c => c.sampleSize)),
  };
}

/**
 * Tìm cột SĐT và mã đơn tốt nhất trong sheet (rows có sẵn)
 */
export function detectColumns(rows: unknown[][]): {
  phoneColIdx: number;
  keyColIdx:   number;
  dateColIdx:  number;
  startRow:    number;
  confidence:  { phone: number; key: number };
} {
  if (!rows || rows.length < 2) return { phoneColIdx:-1, keyColIdx:-1, dateColIdx:-1, startRow:0, confidence:{phone:0,key:0} };

  const headers = rows[0] as string[];
  const numCols = headers.length;
  const scores: ColumnScore[] = [];

  for (let col = 0; col < numCols; col++) {
    const colValues = rows.slice(1, 51).map(r => (r as unknown[])[col]);
    const hScore = scoreColumnByHeader(String(headers[col] || ''));
    const pScore = scoreColumnByPattern(colValues);
    const fScore = scoreColumnByFrequency(colValues);
    scores.push(aggregateColumnScores(hScore, pScore, {phoneScore:0,keyScore:0,dateScore:0,sampleSize:0}, fScore));
  }

  let phoneColIdx = -1, keyColIdx = -1, dateColIdx = -1;
  let bestPhone = COLUMN_CONFIDENCE.PHONE;
  let bestKey   = COLUMN_CONFIDENCE.KEY;
  let bestDate  = 0.4;

  scores.forEach((s, i) => {
    if (s.phoneScore > bestPhone) { bestPhone = s.phoneScore; phoneColIdx = i; }
    if (s.keyScore   > bestKey   && i !== phoneColIdx) { bestKey = s.keyScore; keyColIdx = i; }
    if (s.dateScore  > bestDate) { bestDate = s.dateScore; dateColIdx = i; }
  });

  return {
    phoneColIdx,
    keyColIdx,
    dateColIdx,
    startRow: 1,
    confidence: { phone: bestPhone, key: bestKey },
  };
}

export default {
  PAYROLL_CONSTANTS, COLUMN_CONFIDENCE,
  findClosestSalaryGrade, calcTNCN, calcPayroll, calcSeniority,
  parseDateSafe, scoreColumnByHeader, scoreColumnByPattern,
  scoreColumnByFrequency, aggregateColumnScores, detectColumns,
};
