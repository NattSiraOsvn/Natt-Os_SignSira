import { EventBus } from '../../../../../core/events/event-bus';
/**
 * NATT-OS Audit Hash Engine v1.0
 * Port từ Doc 5 computeMD5() + Doc 9 logAudit() SHA-256
 * Target: audit-cell/domain/engines/
 */

export const AUDIT_SIGNATURE_KEY = 'NATT_OS_AUDIT_SIG_2025';
export const HASH_ALGORITHM: 'SHA-256' | 'SHA-512' = 'SHA-256';

export type AuditAction   = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOCK' | 'UNLOCK' | 'OVERRIDE' | 'EXPORT' | 'IMPORT';
export type AuditSeverity = 'INFO' | 'WARN' | 'CRITICAL';

export interface AuditLogEntry {
  id:          string;
  timestamp:   string;
  entityType:  string;
  entityId:    string;
  action:      AuditAction;
  userId:      string;
  oldValue:    unknown;
  newValue:    unknown;
  severity:    AuditSeverity;
  hash:        string;
  prevHash:    string;
  signature:   string;
}

// ── SHA-256 ───────────────────────────────────────────────────────────────
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data    = encoder.encode(text);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function computeHash(data: string): Promise<string> {
  const full = await sha256(data);
  return full.substring(0, 32);
}

// ── BUILD PAYLOAD ─────────────────────────────────────────────────────────
type AuditPartial = Omit<AuditLogEntry, 'hash' | 'signature'>;

function buildPayload(e: AuditPartial): string {
  return [
    e.timestamp, e.entityType, e.entityId, e.action, e.userId,
    JSON.stringify(e.oldValue ?? ''),
    JSON.stringify(e.newValue ?? ''),
    e.prevHash,
  ].join('||');
}

// ── LOG AUDIT ─────────────────────────────────────────────────────────────
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

  const partial: AuditPartial = {
    id, timestamp,
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

// ── VERIFY CHAIN ──────────────────────────────────────────────────────────
export async function verifyAuditChain(entries: AuditLogEntry[]): Promise<{
  valid: boolean; tamperedAt: number[]; report: string;
}> {
  const tamperedAt: number[] = [];

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    // Build partial without hash/signature using spread — fixes TS2352
    const partial: AuditPartial = {
      id:         e.id,
      timestamp:  e.timestamp,
      entityType: e.entityType,
      entityId:   e.entityId,
      action:     e.action,
      userId:     e.userId,
      oldValue:   e.oldValue,
      newValue:   e.newValue,
      severity:   e.severity,
      prevHash:   e.prevHash,
    };

    const payload      = buildPayload(partial);
    const expectedHash = await sha256(payload);
    const expectedSig  = await sha256(payload + AUDIT_SIGNATURE_KEY);

    const chainOk = i === 0 || e.prevHash === entries[i - 1].hash;
    if (expectedHash !== e.hash || expectedSig !== e.signature || !chainOk) {
      tamperedAt.push(i);
    }
  }

  return {
    valid:      tamperedAt.length === 0,
    tamperedAt,
    report: tamperedAt.length === 0
      ? `Chain valid: ${entries.length} entries`
      : `TAMPERED at indexes: ${tamperedAt.join(', ')}`,
  };
}

// ── FILE SNAPSHOT ─────────────────────────────────────────────────────────
export interface FileSnapshot {
  fileName: string; rowCount: number; colCount: number;
  dataHash: string; snappedAt: string;
}

export async function snapshotRows(rows: unknown[][], fileName: string): Promise<FileSnapshot> {
  const flat     = rows.map(r => (r as unknown[]).join('|')).join('\n');
  const dataHash = await computeHash(flat);
  return { fileName, rowCount: rows.length, colCount: rows[0]?.length ?? 0, dataHash, snappedAt: new Date().toISOString() };
}

export function compareSnapshots(old: FileSnapshot, curr: FileSnapshot): { changed: boolean; details: string } {
  if (old.dataHash === curr.dataHash) return { changed: false, details: 'No change' };
  return { changed: true, details: `Hash changed: ${old.rowCount}→${curr.rowCount} rows` };
}

// ── SMART FIND COLUMN ─────────────────────────────────────────────────────
export function removeVietnameseDiacritics(str: string): string {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().trim();
}

export function smartFindColumn(headers: unknown[], keywords: string[]): number {
  const normKw = keywords.map(k => removeVietnameseDiacritics(k));
  for (let i = 0; i < headers.length; i++) {
    const h = removeVietnameseDiacritics(String(headers[i] ?? ''));
    if (normKw.some(k => h === k)) return i;
  }
  for (let i = 0; i < headers.length; i++) {
    const h = removeVietnameseDiacritics(String(headers[i] ?? ''));
    if (normKw.some(k => h.includes(k) || k.includes(h))) return i;
  }
  EventBus.emit('cell.metric', { cell: 'audit-cell', metric: 'engine.executed', value: 1, ts: Date.now() });

  return -1;
}

export const ACCOUNTING_COLUMNS = {
  NKC:    ['ngay', 'chung tu', 'dien giai', 'tai khoan no', 'tai khoan co', 'so tien'],
  SO_CAI: ['ngay', 'so hieu', 'dien giai', 'phat sinh no', 'phat sinh co', 'so du'],
  CDPS:   ['tai khoan', 'so hieu', 'so du dau', 'phat sinh no', 'phat sinh co', 'so du cuoi'],
} as const;

export default {
  AUDIT_SIGNATURE_KEY, ACCOUNTING_COLUMNS,
  computeHash, logAudit, verifyAuditChain,
  snapshotRows, compareSnapshots,
  removeVietnameseDiacritics, smartFindColumn,
};
