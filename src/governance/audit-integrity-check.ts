// @ts-nocheck
/**
 * Audit Integrity Check — Điều 6
 * Kiểm tra tính toàn vẹn của audit chain
 * "No audit = doesn't exist"
 */

export interface AuditIntegrityResult {
  timestamp: number;
  chainLength: number;
  validHashes: number;
  brokenLinks: number;
  missingRecords: number;
  integrityScore: number;  // 0-100
  status: "INTACT" | "COMPROMISED" | "EMPTY";
  issues: string[];
}

/** Simple hash (runtime — production dùng crypto.subtle) */
const hashString = (s: string): string => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16).padStart(8, "0");
};

export const AuditIntegrityCheck = {
  /** Verify một chain của AuditRecord */
  verifyChain: (records: Array<{ id: string; prevHash: string; hash: string; data: any }>): AuditIntegrityResult => {
    const issues: string[] = [];
    let validHashes = 0;
    let brokenLinks = 0;

    if (records.length === 0) return {
      timestamp: Date.now(), chainLength: 0, validHashes: 0,
      brokenLinks: 0, missingRecords: 0, integrityScore: 100,
      status: "EMPTY", issues: ["No audit records to verify"],
    };

    // Verify hash chain
    let prevHash = "GENESIS";
    for (const record of records) {
      if (record.prevHash !== prevHash) {
        brokenLinks++;
        issues.push(`BROKEN_LINK: Record ${record.id} — expected prevHash ${prevHash}, got ${record.prevHash}`);
      }
      // Verify self hash
      const expectedHash = hashString(record.prevHash + JSON.stringify(record.data));
      if (record.hash !== expectedHash) {
        issues.push(`HASH_MISMATCH: Record ${record.id} — hash tampered`);
      } else {
        validHashes++;
      }
      prevHash = record.hash;
    }

    const integrityScore = Math.round((validHashes / records.length) * 100);
    const status = brokenLinks > 0 ? "COMPROMISED" : "INTACT";

    return {
      timestamp: Date.now(),
      chainLength: records.length,
      validHashes,
      brokenLinks,
      missingRecords: 0,
      integrityScore,
      status,
      issues,
    };
  },

  /** Generate hash cho record mới */
  generateHash: (prevHash: string, data: any): string =>
    hashString(prevHash + JSON.stringify(data)),

  /** Quick check — chỉ kiểm tra structure */
  quickCheck: (records: any[]): boolean => {
    if (!Array.isArray(records)) return false;
    return records.every(r => r.id && r.hash && typeof r.prevHash === "string");
  },

  /** Format kết quả */
  format: (result: AuditIntegrityResult): string => {
    const icon = result.status === "INTACT" ? "✅" : result.status === "EMPTY" ? "⚠️" : "❌";
    return [
      `${icon} Audit Chain: ${result.status}`,
      `   Length: ${result.chainLength} | Valid: ${result.validHashes} | Score: ${result.integrityScore}%`,
      ...result.issues.map(i => `   ⚠️  ${i}`),
    ].join("\n");
  },
};

export default AuditIntegrityCheck;
