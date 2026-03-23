/**
 * NATT-OS Audit Hash Engine v1.0
 * Port từ Doc 5 computeMD5() + Doc 9 logAudit() SHA-256
 * Target: audit-cell/domain/engines/
 *
 * Hàm 5: logAudit() — tamper-proof SHA-256 audit log
 * Hàm 6: computeMD5() — file/row integrity check
 * Hàm 7: smartFindColumn() NFD normalize — robust column detection
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────
export const AUDIT_SIGNATURE_KEY = 'NATT_OS_AUDIT_SIG_2025';
export const HASH_ALGORITHM: 'SHA-256' | 'SHA-512' = 'SHA-256';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOCK' | 'UNLOCK' | 'OVERRIDE' | 'EXPORT' | 'IMPORT';
export type AuditSeverity = 'INFO' | 'WARN' | 'CRITICAL';

// ── AUDIT LOG ENTRY ───────────────────────────────────────────────────────
export interface AuditLogEntry {
  id:          string;
  timestamp:   string;     // ISO
  entityType:  string;     // cell name
  entityId:    string;     // record id
  action:      AuditAction;
  userId:      string;
  oldValue:    unknown;
  newValue:    unknown;
  severity:    AuditSeverity;
  hash:        string;     // SHA-256 tamper-proof
  prevHash:    string;     // link to previous entry (blockchain-style)
  signature:   string;     // HMAC-like: hash(payload + SIGNATURE_KEY)
}

// ── SHA-256 BROWSER-SAFE ───────────────────────────────────────────────────
/**
 * sha256 — browser Web Crypto API
 * Port từ Doc 9 logAudit() Utilities.computeDigest SHA-256 pattern
 */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data    = encoder.encode(text);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * md5Simple — MD5 approximation cho file integrity
 * Port từ Doc 5 computeMD5() pattern
 * Lưu ý: dùng SHA-256 truncated vì browser không có MD5 native
 */
export async function computeHash(data: string): Promise<string> {
  const full = await sha256(data);
  return full.substring(0, 32); // first 32 chars (128 bits) — MD5-length compatible
}

// ── BUILD AUDIT PAYLOAD ────────────────────────────────────────────────────
function buildPayload(entry: Omit<AuditLogEntry, 'hash' | 'signature'>): string {
  return [
    entry.timestamp,
    entry.entityType,
    entry.entityId,
    entry.action,
    entry.userId,
    JSON.stringify(entry.oldValue ?? ''),
    JSON.stringify(entry.newValue ?? ''),
    entry.prevHash,
  ].join('||');
}

// ── LOG AUDIT ──────────────────────────────────────────────────────────────
/**
 * logAudit — port từ Doc 9
 * Tạo 1 audit entry với SHA-256 hash + chain link với entry trước
 * Mỗi entry hash phụ thuộc vào prevHash → không thể chèn entry giả mạo
 */
export async function logAudit(params: {
  entityType: string;
  entityId:   string;
  action:     AuditAction;
  userId:     string;
  oldValue?:  unknown;
  newValue?:  unknown;
  severity?:  AuditSeverity;
  prevHash?:  string;
}): Promise<AuditLogEntry> {
  const timestamp = new Date().toISOString();
  const id        = `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const prevHash  = params.prevHash ?? '0000000000000000';

  const partial: Omit<AuditLogEntry, 'hash' | 'signature'> = {
    id,
    timestamp,
    entityType: params.entityType,
    entityId:   params.entityId,
    action:     params.action,
    userId:     params.userId,
    oldValue:   params.oldValue ?? null,
    newValue:   params.newValue ?? null,
    severity:   params.severity ?? 'INFO',
    prevHash,
  };

  const payload   = buildPayload(partial);
  const hash      = await sha256(payload);
  const signature = await sha256(payload + AUDIT_SIGNATURE_KEY);

  return { ...partial, hash, signature };
}

// ── VERIFY AUDIT CHAIN ─────────────────────────────────────────────────────
/**
 * verifyAuditChain — kiểm tra tính toàn vẹn của audit log
 * Phát hiện entry bị tamper hoặc chèn vào giữa
 */
export async function verifyAuditChain(entries: AuditLogEntry[]): Promise<{
  valid:        boolean;
  tamperedAt:   number[];  // indexes bị tamper
  report:       string;
}> {
  const tamperedAt: number[] = [];

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];

    // Re-compute hash
    const partial = { ...e } as Record<string, unknown>;
    delete (partial as AuditLogEntry).hash;
    delete (partial as AuditLogEntry).signature;

    const payload        = buildPayload(e as unknown as Omit<AuditLogEntry, 'hash' | 'signature'>);
    const expectedHash   = await sha256(payload);
    const expectedSig    = await sha256(payload + AUDIT_SIGNATURE_KEY);

    const hashOk  = expectedHash === e.hash;
    const sigOk   = expectedSig  === e.signature;
    const chainOk = i === 0 || e.prevHash === entries[i - 1].hash;

    if (!hashOk || !sigOk || !chainOk) {
      tamperedAt.push(i);
    }
  }

  return {
    valid:      tamperedAt.length === 0,
    tamperedAt,
    report:     tamperedAt.length === 0
      ? `Chain valid: ${entries.length} entries`
      : `TAMPERED at indexes: ${tamperedAt.join(', ')} — tong ${entries.length} entries`,
  };
}

// ── FILE SNAPSHOT ──────────────────────────────────────────────────────────
export interface FileSnapshot {
  fileName:  string;
  rowCount:  number;
  colCount:  number;
  dataHash:  string;
  snappedAt: string;
}

/**
 * snapshotRows — tạo hash snapshot của data table
 * Port từ Doc 5 computeMD5() pattern — dùng cho fraud detection
 * Khi data bị sửa → hash thay đổi → phát hiện ngay
 */
export async function snapshotRows(
  rows:     unknown[][],
  fileName: string,
): Promise<FileSnapshot> {
  const flat     = rows.map(r => r.join('|')).join('\n');
  const dataHash = await computeHash(flat);

  return {
    fileName,
    rowCount:  rows.length,
    colCount:  rows[0]?.length ?? 0,
    dataHash,
    snappedAt: new Date().toISOString(),
  };
}

export function compareSnapshots(old: FileSnapshot, curr: FileSnapshot): {
  changed:   boolean;
  details:   string;
} {
  if (old.dataHash === curr.dataHash) {
    return { changed: false, details: 'No change' };
  }
  return {
    changed: true,
    details: `Hash changed: ${old.rowCount}→${curr.rowCount} rows, ${old.colCount}→${curr.colCount} cols`,
  };
}

// ── SMART FIND COLUMN ──────────────────────────────────────────────────────
/**
 * smartFindColumn — port từ Doc 5 (NFD normalize, khong dau)
 * Robust hon findHeaderRow() hien tai: xu ly dau tieng Viet + alias
 */
export function removeVietnameseDiacritics(str: string): string {
  if (!str) return '';
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function smartFindColumn(
  headers:   unknown[],
  keywords:  string[],
): number {
  const normKeywords = keywords.map(k => removeVietnameseDiacritics(k));

  // Round 1: exact normalized match
  for (let i = 0; i < headers.length; i++) {
    const h = removeVietnameseDiacritics(String(headers[i] ?? ''));
    if (normKeywords.some(k => h === k)) return i;
  }

  // Round 2: contains match
  for (let i = 0; i < headers.length; i++) {
    const h = removeVietnameseDiacritics(String(headers[i] ?? ''));
    if (normKeywords.some(k => h.includes(k) || k.includes(h))) return i;
  }

  return -1;
}

/** Column definitions for accounting books (NKC / So Cai / CDPS) */
export const ACCOUNTING_COLUMNS = {
  NKC:  ['ngay', 'chung tu', 'dien giai', 'tai khoan no', 'tai khoan co', 'so tien', 'so tham chieu'],
  SO_CAI: ['ngay', 'so hieu', 'dien giai', 'phat sinh no', 'phat sinh co', 'so du'],
  CDPS: ['tai khoan', 'so hieu', 'so du dau', 'phat sinh no', 'phat sinh co', 'so du cuoi'],
} as const;

export default {
  AUDIT_SIGNATURE_KEY, HASH_ALGORITHM, ACCOUNTING_COLUMNS,
  computeHash, logAudit, verifyAuditChain,
  snapshotRows, compareSnapshots,
  removeVietnameseDiacritics, smartFindColumn,
};
