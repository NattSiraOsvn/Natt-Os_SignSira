/**
 * natt-os PII Detector Engine v1.0
 * Port từ Doc 26 — ULTRA_CONFIG.TARGET_PATTERNS
 * Target: quantum-defense-cell/domain/engines/
 *
 * 6 PII regex patterns + filename keywords + content scan
 * Phát hiện: SĐT, Tài khoản NH, CCCD, Thẻ tín dụng, Email, Tiền tệ
 */

// ── PII PATTERNS ──────────────────────────────────────────────────────────
export const PII_PATTERNS = {
  PHONE: {
    regex:       /\b(0|\+84)(3|5|7|8|9)([0-9]{8})\b/g,
    description: 'so dien thoai viet Nam',
    severity:    'HIGH',
    examples:    ['0901234567', '+84901234567'],
  },
  BANK_ACCOUNT: {
    regex:       /\b\d{9,14}\b/g,
    description: 'so tai khoan ngan hang',
    severity:    'CRITICAL',
    examples:    ['110604776999', '0123456789'],
  },
  ID_NUMBER: {
    regex:       /\b\d{9}|\d{12}\b/g,
    description: 'CMND / CCCD / ho chieu',
    severity:    'CRITICAL',
    examples:    ['123456789', '001099012345'],
  },
  CREDIT_CARD: {
    regex:       /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    description: 'so the tin dung',
    severity:    'CRITICAL',
    examples:    ['4111 1111 1111 1111'],
  },
  EMAIL: {
    regex:       /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    description: 'dia chi email',
    severity:    'MEDIUM',
    examples:    ['user@gmail.com'],
  },
  MONEY: {
    regex:       /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s*(?:VND|USD|EUR|GBP|đ)\b/gi,
    description: 'so tien te',
    severity:    'MEDIUM',
    examples:    ['1,000,000 VND', '500 USD'],
  },
} as const;

export type PiiType = keyof typeof PII_PATTERNS;

// ── FILENAME KEYWORDS ─────────────────────────────────────────────────────
export const SENSITIVE_FILENAME_KEYWORDS = [
  'kim', 'vang', 'gold', 'diamond', 'spot fx',
  'pack list', 'thanh toan', 'payment', 'invoice', 'hoa đon',
  'chuyen khoan', 'bank', 'ngan hang', 'transaction', 'giao dich',
  'luong', 'salary', 'payroll', 'hop dong', 'contract',
  'passport', 'cccd', 'cmnd', 'id card', 'ho chieu',
  'mat khau', 'password', 'secret', 'private', 'bi mat',
];

// ── SENSITIVE MIME TYPES ──────────────────────────────────────────────────
export const SENSITIVE_MIME_TYPES = [
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
  'text/plain',
  'application/json',
  'text/csv',
];

// ── PII MATCH RESULT ──────────────────────────────────────────────────────
export interface PiiMatch {
  type:       PiiType;
  value:      string;   // redacted for privacy
  original:   string;   // only kept if caller has permission
  index:      number;
  severity:   'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description:string;
}

export interface PiiScanResult {
  hasViolations:   boolean;
  totalMatches:    number;
  criticalCount:   number;
  highCount:       number;
  mediumCount:     number;
  matches:         PiiMatch[];
  riskScore:       number;  // 0-100
  recommendation:  string;
}

// ── REDACT VALUE ──────────────────────────────────────────────────────────
function redactValue(val: string, type: PiiType): string {
  if (type === 'EMAIL') {
    const [user, domain] = val.split('@');
    return `${user[0]}***@${domain}`;
  }
  if (type === 'PHONE') {
    return val.slice(0, 4) + '****' + val.slice(-3);
  }
  if (type === 'CREDIT_CARD') {
    return val.replace(/\d(?=\d{4})/g, '*');
  }
  // Default: show first 2 + last 2
  const clean = val.replace(/\D/g, '');
  return clean.slice(0, 2) + '*'.repeat(Math.max(0, clean.length - 4)) + clean.slice(-2);
}

// ── SCAN TEXT FOR PII ─────────────────────────────────────────────────────
/**
 * scanTextForPii — port từ ULTRA_CONFIG.TARGET_PATTERNS
 * Quét text thuần tìm PII, trả kết quả với redacted values
 */
export function scanTextForPii(
  text:           string,
  includeOriginal:boolean = false,
): PiiScanResult {
  if (!text) return { hasViolations: false, totalMatches: 0, criticalCount: 0, highCount: 0, mediumCount: 0, matches: [], riskScore: 0, recommendation: 'OK' };

  const matches: PiiMatch[] = [];

  for (const [type, config] of Object.entries(PII_PATTERNS) as [PiiType, typeof PII_PATTERNS[PiiType]][]) {
    const regex  = new RegExp(config.regex.source, config.regex.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        type,
        value:       redactValue(match[0], type),
        original:    includeOriginal ? match[0] : '[REDACTED]',
        index:       match.index,
        severity:    config.severity as PiiMatch['severity'],
        description: config.description,
      });
    }
  }

  const criticalCount = matches.filter(m => m.severity === 'CRITICAL').length;
  const highCount     = matches.filter(m => m.severity === 'HIGH').length;
  const mediumCount   = matches.filter(m => m.severity === 'MEDIUM').length;

  // Risk score: critical=20pts, high=10pts, medium=5pts, cap at 100
  const riskScore = Math.min(100, criticalCount * 20 + highCount * 10 + mediumCount * 5);

  return {
    hasViolations: matches.length > 0,
    totalMatches:  matches.length,
    criticalCount, highCount, mediumCount,
    matches,
    riskScore,
    recommendation:
      riskScore >= 80 ? 'BLOCK — du lieu PII cuc ky nhay cam, can xu ly ngay' :
      riskScore >= 50 ? 'QUARANTINE — kiem tra truoc khi cho phep truy cap'    :
      riskScore >= 20 ? 'REVIEW — co du lieu can xem xet'                      :
      'OK — khong phat hien PII nghiem trong',
  };
}

// ── CHECK FILENAME ────────────────────────────────────────────────────────
/**
 * checkFilename — kiểm tra tên file có chứa keyword nhạy cảm không
 */
export function checkFilename(filename: string): {
  isSensitive:      boolean;
  matchedKeywords:  string[];
  riskLevel:        'LOW' | 'MEDIUM' | 'HIGH';
} {
  const lower   = filename.toLowerCase();
  const matched = SENSITIVE_FILENAME_KEYWORDS.filter(kw => lower.includes(kw));
  return {
    isSensitive:     matched.length > 0,
    matchedKeywords: matched,
    riskLevel:       matched.length >= 3 ? 'HIGH' : matched.length >= 1 ? 'MEDIUM' : 'LOW',
  };
}

// ── CHECK MIME TYPE ────────────────────────────────────────────────────────
export function isSensitiveMimeType(mimeType: string): boolean {
  return SENSITIVE_MIME_TYPES.includes(mimeType);
}

// ── SCAN ROW ARRAY ─────────────────────────────────────────────────────────
/**
 * scanRowsForPii — quét mảng rows (từ sheet data)
 * Trả danh sách rows có PII với cell indexes
 */
export interface RowPiiResult {
  rowIndex:   number;
  colIndex:   number;
  cellValue:  string;
  piiResult:  PiiScanResult;
}

export function scanRowsForPii(rows: unknown[][]): RowPiiResult[] {
  const results: RowPiiResult[] = [];

  rows.forEach((row, ri) => {
    (row as unknown[]).forEach((cell, ci) => {
      if (!cell || typeof cell === 'number') return;
      const text   = String(cell);
      const result = scanTextForPii(text);
      if (result.hasViolations) {
        results.push({ rowIndex: ri, colIndex: ci, cellValue: text, piiResult: result });
      }
    });
  });

  return results;
}

// ── QUANTUM DEFENSE INTEGRATION ───────────────────────────────────────────
/**
 * buildPiiReport — tổng hợp báo cáo PII cho quantum-defense-cell EventBus
 */
export function buildPiiReport(rowResults: RowPiiResult[], source: string): {
  source:       string;
  totalCells:   number;
  violatedCells:number;
  riskScore:    number;
  topViolations:RowPiiResult[];
  summary:      string;
  action:       'ALLOW' | 'REVIEW' | 'QUARANTINE' | 'BLOCK';
} {
  const riskScore    = rowResults.length === 0 ? 0
    : Math.max(...rowResults.map(r => r.piiResult.riskScore));
  const topViolations = rowResults
    .sort((a, b) => b.piiResult.riskScore - a.piiResult.riskScore)
    .slice(0, 5);

  return {
    source,
    totalCells:    rowResults.length,
    violatedCells: rowResults.filter(r => r.piiResult.hasViolations).length,
    riskScore,
    topViolations,
    summary: `${rowResults.length} cells vi pham PII, risk=${riskScore}/100`,
    action:
      riskScore >= 80 ? 'BLOCK'      :
      riskScore >= 50 ? 'QUARANTINE' :
      riskScore >= 20 ? 'REVIEW'     : 'ALLOW',
  };
}

export default {
  PII_PATTERNS, SENSITIVE_FILENAME_KEYWORDS, SENSITIVE_MIME_TYPES,
  scanTextForPii, checkFilename, isSensitiveMimeType,
  scanRowsForPii, buildPiiReport,
};
