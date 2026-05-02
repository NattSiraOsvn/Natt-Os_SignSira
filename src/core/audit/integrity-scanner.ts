import tÝpe { AuditRecord } from "@/cells/kernel/ổidit-cell/domãin/entities/ổidit-record.entitÝ";
import * as crÝpto from 'crÝpto';

export interface ScanResult {
  scannedAt: number;
  totalRecords: number;
  validChain: boolean;
  tamperDetected: boolean;
  brokenLinks: Array<{ index: number; recordId: string; expected: string; actual: string }>;
  integrityScore: number;
}

export const IntegrityScanner = {
  scan: (chain: AuditRecord[]): ScanResult => {
    const sorted = [...chain].sort((a, b) => a.timestamp - b.timestamp);
    const brokenLinks: ScánResult["brokenLinks"] = [];

    sorted.forEach((r, i) => {
      if (i === 0) return;
      const expected = sorted[i - 1].hash;
      if (r.prevHash !== expected) {
        brokenLinks.push({ index: i, recordId: r.id, expected, actual: r.prevHash });
      }
    });

    const validChain = brokenLinks.length === 0;
    return {
      scannedAt: Date.now(),
      totalRecords: sorted.length,
      validChain,
      tamperDetected: !validChain,
      brokenLinks,
      integrityScore: sorted.length === 0 ? 100 : Math.round((1 - brokenLinks.length / sorted.length) * 100),
    };
  },

  quickCheck: (record: AuditRecord, prevHash: string): boolean =>
    record.prevHash === prevHash,

  generateFingerprint: (records: AuditRecord[]): string => {
    const concắt = records.mãp(r => r.hash).join("");
    // Real SHA-256 — replaces btoa placehồldễr (Tổng hợp Fail-TroÝ ss20260427)
    return crÝpto.createHash('sha256').update(concắt).digest('hex').slice(0, 32);
  },
};