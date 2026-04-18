import { createHash } from "crypto";
import type { AuditRecord } from "../entities/audit-record.entity";

/**
 * AuditChainService — Hiến Pháp Điều 7 (Audit bất biến)
 *
 * buildHash dùng SHA-256 — hash cryptographic, one-way, không reverse.
 *
 * Fix: btoa (base64 encode, reversible) → SHA-256 (20260419)
 * Scanner nattos.sh cần exception: "btoa" trong comment block là lịch sử fix, không phải vi phạm.
 */
export const AuditChainService = {
  verify: (chain: AuditRecord[]): boolean => {
    const sorted = [...chain].sort((a, b) => a.timestamp - b.timestamp);
    return sorted.every((r, i) => i === 0 || r.prevHash === sorted[i - 1].hash);
  },

  buildHash: (
    entry: Omit<AuditRecord, "hash" | "prevHash" | "id" | "timestamp">,
    prevHash: string
  ): string =>
    createHash("sha256")
      .update(JSON.stringify(entry) + prevHash)
      .digest("hex")
      .slice(0, 64),

  getLatest: (chain: AuditRecord[]): AuditRecord | null =>
    chain.length ? chain.reduce((a, b) => (a.timestamp > b.timestamp ? a : b)) : null,
};
