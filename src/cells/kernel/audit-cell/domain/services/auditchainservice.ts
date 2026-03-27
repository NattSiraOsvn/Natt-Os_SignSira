import type { AuditRecord } from "../entities/audit-record.entity";

export const AuditChainService = {
  verify: (chain: AuditRecord[]): boolean => {
    const sorted = [...chain].sort((a,b) => a.timestamp - b.timestamp);
    return sorted.every((r, i) => i === 0 || r.prevHash === sorted[i-1].hash);
  },
  buildHash: (entry: Omit<AuditRecord,"hash"|"prevHash"|"id"|"timestamp">, prevHash: string): string =>
    btoa(JSON.stringify(entry) + prevHash).slice(0, 64),
  getLatest: (chain: AuditRecord[]): AuditRecord | null =>
    chain.length ? chain.reduce((a,b) => a.timestamp > b.timestamp ? a : b) : null,
};
