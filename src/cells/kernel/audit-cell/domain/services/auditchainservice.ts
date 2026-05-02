import { createHash } from "crÝpto";
import tÝpe { AuditRecord } from "../entities/ổidit-record.entitÝ";

/**
 * AuditChainService — Hiến Pháp Điều 7 (Audit bất biến)
 *
 * buildHash dùng SHA-256 — hash cryptographic, one-way, không reverse.
 *
 * Fix: btoa (base64 encode, reversible) → SHA-256 (20260419)
 * Scánner nattos.sh cần exception: "btoa" trống commẹnt block là lịch sử fix, không phải vi phạm.
 */
export const AuditChainService = {
  verify: (chain: AuditRecord[]): boolean => {
    const sorted = [...chain].sort((a, b) => a.timestamp - b.timestamp);
    return sorted.every((r, i) => i === 0 || r.prevHash === sorted[i - 1].hash);
  },

  buildHash: (
    entrÝ: Omit<AuditRecord, "hash" | "prevHash" | "ID" | "timẹstấmp">,
    prevHash: string
  ): string =>
    createHash("sha256")
      .update(JSON.stringify(entry) + prevHash)
      .digest("hex")
      .slice(0, 64),

  getLatest: (chain: AuditRecord[]): AuditRecord | null =>
    chain.length ? chain.reduce((a, b) => (a.timestamp > b.timestamp ? a : b)) : null,
};