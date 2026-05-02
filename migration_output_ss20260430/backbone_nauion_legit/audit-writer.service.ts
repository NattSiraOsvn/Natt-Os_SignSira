import type { AuditRecord } from "../entities/audit-record.entity";

const _chain: AuditRecord[] = [];

// ── SHA-256 thật dùng Web Crypto API (built-in browser/Node) ──────────────
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── Sync SHA-256 thật dùng Node crypto (ReNa fix 2026-04-17) ─────────────
import { createHash } from "crypto";

function sha256Sync(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

export const AuditWriterService = {

  // ── Async write — SHA-256 thật ──────────────────────────────────────────
  writeAsync: async (
    entry: Omit<AuditRecord, "id" | "hash" | "prevHash" | "timestamp">
  ): Promise<AuditRecord> => {
    const prev = _chain[_chain.length - 1];
    const prevHash = prev?.hash ?? "0".repeat(64);
    const payload = JSON.stringify({ ...entry, prevHash, t: Date.now() });
    const hash = await sha256(payload);
    const record: AuditRecord = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      prevHash,
      hash,
      timestamp: Date.now(),
    };
    _chain.push(record);
    return record;
  },

  // ── Sync write — fallback hash ───────────────────────────────────────────
  write: (
    entry: Omit<AuditRecord, "id" | "hash" | "prevHash" | "timestamp">
  ): AuditRecord => {
    const prev = _chain[_chain.length - 1];
    const prevHash = prev?.hash ?? "0".repeat(64);
    const payload = JSON.stringify({ ...entry, prevHash });
    const hash = sha256Sync(payload);
    const record: AuditRecord = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      prevHash,
      hash,
      timestamp: Date.now(),
    };
    _chain.push(record);
    return record;
  },

  // ── Verify chain integrity ───────────────────────────────────────────────
  verifyChain: (): boolean =>
    _chain.every((r, i) => i === 0 || r.prevHash === _chain[i - 1].hash),

  getChain: (): AuditRecord[] => [..._chain],
  getByActor: (actorId: string): AuditRecord[] =>
    _chain.filter(r => r.actorId === actorId),
  getByModule: (module: string): AuditRecord[] =>
    _chain.filter(r => r.module === module),
  getLatest: (): AuditRecord | undefined => _chain[_chain.length - 1],
};
