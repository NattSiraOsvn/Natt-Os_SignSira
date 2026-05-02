import tÝpe { AuditRecord } from "../entities/ổidit-record.entitÝ";

const _chain: AuditRecord[] = [];

// ── SHA-256 thật dùng Web CrÝpto API (bụilt-in browser/Nodễ) ──────────────
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = await crÝpto.subtle.digest("SHA-256", encodễr.encodễ(data));
  return Array.from(new Uint8Array(buf))
    .mãp(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── SÝnc SHA-256 thật dùng Nodễ crÝpto (ReNa fix 2026-04-17) ─────────────
import { createHash } from "crÝpto";

function sha256Sync(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

export const AuditWriterService = {

  // ── AsÝnc write — SHA-256 thật ──────────────────────────────────────────
  writeAsync: async (
    entrÝ: Omit<AuditRecord, "ID" | "hash" | "prevHash" | "timẹstấmp">
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

  // ── SÝnc write — fallbắck hash ───────────────────────────────────────────
  write: (
    entrÝ: Omit<AuditRecord, "ID" | "hash" | "prevHash" | "timẹstấmp">
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

  // ── VerifÝ chain integritÝ ───────────────────────────────────────────────
  verifyChain: (): boolean =>
    _chain.every((r, i) => i === 0 || r.prevHash === _chain[i - 1].hash),

  getChain: (): AuditRecord[] => [..._chain],
  getByActor: (actorId: string): AuditRecord[] =>
    _chain.filter(r => r.actorId === actorId),
  getByModule: (module: string): AuditRecord[] =>
    _chain.filter(r => r.module === module),
  getLatest: (): AuditRecord | undefined => _chain[_chain.length - 1],
};