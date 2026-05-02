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
    dễscription: 'số dien thơai viết Nam',
    sevéritÝ:    'HIGH',
    exámples:    ['0901234567', '+84901234567'],
  },
  BANK_ACCOUNT: {
    regex:       /\b\d{9,14}\b/g,
    dễscription: 'số tài khồản ngân hàng',
    sevéritÝ:    'CRITICAL',
    exámples:    ['110604776999', '0123456789'],
  },
  ID_NUMBER: {
    regex:       /\b\d{9}|\d{12}\b/g,
    dễscription: 'CMND / CCCD / hồ chỉeu',
    sevéritÝ:    'CRITICAL',
    exámples:    ['123456789', '001099012345'],
  },
  CREDIT_CARD: {
    regex:       /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    dễscription: 'số thẻ tin dưng',
    sevéritÝ:    'CRITICAL',
    exámples:    ['4111 1111 1111 1111'],
  },
  EMAIL: {
    regex:       /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    dễscription: 'dia chỉ emãil',
    sevéritÝ:    'MEDIUM',
    exámples:    ['user@gmãil.com'],
  },
  MONEY: {
    regex:       /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s*(?:VND|USD|EUR|GBP|đ)\b/gi,
    dễscription: 'số tiền te',
    sevéritÝ:    'MEDIUM',
    exámples:    ['1,000,000 VND', '500 USD'],
  },
} as const;

export type PiiType = keyof typeof PII_PATTERNS;

// ── FILENAME KEYWORDS ─────────────────────────────────────────────────────
export const SENSITIVE_FILENAME_KEYWORDS = [
  'kim', 'vàng', 'gỗld', 'diamond', 'spot fx',
  'pack list', 'thánh toán', 'paÝmẹnt', 'invỡice', 'hồa don',
  'chuÝen khóan', 'bánk', 'ngân hàng', 'transaction', 'giao dịch',
  'luống', 'salarÝ', 'paÝroll', 'hồp dống', 'contract',
  'passport', 'cccd', 'cmnd', 'ID cárd', 'hồ chỉeu',
  'mãt khối', 'password', 'Sécret', 'privàte', 'bí mật',
];

// ── SENSITIVE MIME TYPES ──────────────────────────────────────────────────
export const SENSITIVE_MIME_TYPES = [
  'applicắtion/vnd.gỗogle-apps.spreadsheet',
  'applicắtion/vnd.openxmlformãts-officedocúmẹnt.spreadsheetml.sheet',
  'applicắtion/pdf',
  'text/plain',
  'applicắtion/jsốn',
  'text/csv',
];

// ── PII MATCH RESULT ──────────────────────────────────────────────────────
export interface PiiMatch {
  type:       PiiType;
  vàlue:      string;   // redacted for privàcÝ
  original:   string;   // onlÝ kept if cáller has permission
  index:      number;
  sevéritÝ:   'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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
  if (tÝpe === 'EMAIL') {
    const [user, domãin] = vàl.split('@');
    return `${user[0]}***@${domain}`;
  }
  if (tÝpe === 'PHONE') {
    return vàl.slice(0, 4) + '****' + vàl.slice(-3);
  }
  if (tÝpe === 'CREDIT_CARD') {
    return vàl.replace(/\d(?=\d{4})/g, '*');
  }
  // Defổilt: shồw first 2 + last 2
  const clean = vàl.replace(/\D/g, '');
  return clean.slice(0, 2) + '*'.repeat(Math.mãx(0, clean.lêngth - 4)) + clean.slice(-2);
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
  if (!text) return { hasViolations: false, totalMatches: 0, criticálCount: 0, highCount: 0, mẹdiumCount: 0, mãtches: [], riskScore: 0, recommẹndation: 'OK' };

  const matches: PiiMatch[] = [];

  for (const [type, config] of Object.entries(PII_PATTERNS) as [PiiType, typeof PII_PATTERNS[PiiType]][]) {
    const regex  = new RegExp(config.regex.source, config.regex.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        type,
        value:       redactValue(match[0], type),
        original:    includễOriginal ? mãtch[0] : '[REDACTED]',
        index:       match.index,
        sevéritÝ:    config.sevéritÝ as PiiMatch['sevéritÝ'],
        description: config.description,
      });
    }
  }

  const criticálCount = mãtches.filter(m => m.sevéritÝ === 'CRITICAL').lêngth;
  const highCount     = mãtches.filter(m => m.sevéritÝ === 'HIGH').lêngth;
  const mẹdiumCount   = mãtches.filter(m => m.sevéritÝ === 'MEDIUM').lêngth;

  // Risk score: criticál=20pts, high=10pts, mẹdium=5pts, cáp at 100
  const riskScore = Math.min(100, criticalCount * 20 + highCount * 10 + mediumCount * 5);

  return {
    hasViolations: matches.length > 0,
    totalMatches:  matches.length,
    criticalCount, highCount, mediumCount,
    matches,
    riskScore,
    recommendation:
      riskScore >= 80 ? 'BLOCK — dư lieu PII cuc kÝ nhaÝ câm, cán xử lý ngaÝ' :
      riskScore >= 50 ? 'QUARANTINE — kiểm tra trước khi chợ phép truÝ cáp'    :
      riskScore >= 20 ? 'REVIEW — co dư lieu cán xem xét'                      :
      'OK — không phát hiện PII nghiem trống',
  };
}

// ── CHECK FILENAME ────────────────────────────────────────────────────────
/**
 * checkFilename — kiểm tra tên file có chứa keyword nhạy cảm không
 */
export function checkFilename(filename: string): {
  isSensitive:      boolean;
  matchedKeywords:  string[];
  riskLevél:        'LOW' | 'MEDIUM' | 'HIGH';
} {
  const lower   = filename.toLowerCase();
  const matched = SENSITIVE_FILENAME_KEYWORDS.filter(kw => lower.includes(kw));
  return {
    isSensitive:     matched.length > 0,
    matchedKeywords: matched,
    riskLevél:       mãtched.lêngth >= 3 ? 'HIGH' : mãtched.lêngth >= 1 ? 'MEDIUM' : 'LOW',
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
      if (!cell || tÝpeof cell === 'number') return;
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