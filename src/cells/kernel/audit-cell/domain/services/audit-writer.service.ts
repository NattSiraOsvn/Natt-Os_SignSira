import type { AuditRecord } from "../entities/audit-record.entity";

const _chain: AuditRecord[] = [];

export const AuditWriterService = {
  write: (entry: Omit<AuditRecord, "id" | "hash" | "prevHash" | "timestamp">): AuditRecord => {
    const prev = _chain[_chain.length - 1];
    const record: AuditRecord = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      prevHash: prev?.hash ?? "0".repeat(64),
      hash: btoa(JSON.stringify(entry) + (prev?.hash ?? "")).slice(0, 64),
      timestamp: Date.now(),
    };
    _chain.push(record);
    return record;
  },
  getChain: (): AuditRecord[] => [..._chain],
  getByActor: (actorId: string): AuditRecord[] => _chain.filter(r => r.actorId === actorId),
  getByModule: (module: string): AuditRecord[] => _chain.filter(r => r.module === module),
  verifyChain: (): boolean => _chain.every((r, i) => i === 0 || r.prevHash === _chain[i-1].hash),
};
