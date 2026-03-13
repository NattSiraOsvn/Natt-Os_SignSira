// @ts-nocheck
import type { CellHealth } from "../entities/cell-health.entity";
const _registry = new Map<string, CellHealth>();
export const ConfidenceCalculatorService = {
  register: (cellId: string, wave: 1|2|3): void => {
    _registry.set(cellId, { cellId, confidenceScore: 100, status: "HEALTHY", lastChecked: Date.now(), issues: [], wave });
  },
  update: (cellId: string, delta: number, issues: string[] = []): CellHealth => {
    const h = _registry.get(cellId) ?? { cellId, confidenceScore: 100, status: "HEALTHY" as const, lastChecked: Date.now(), issues: [], wave: 3 as const };
    const score = Math.max(0, Math.min(100, h.confidenceScore + delta));
    const status = score >= 80 ? "HEALTHY" : score >= 50 ? "DEGRADED" : score >= 20 ? "CRITICAL" : "ELIMINATED";
    const updated = { ...h, confidenceScore: score, status: status as CellHealth["status"], lastChecked: Date.now(), issues };
    _registry.set(cellId, updated);
    return updated;
  },
  get: (cellId: string): CellHealth | null => _registry.get(cellId) ?? null,
  getAll: (): CellHealth[] => [..._registry.values()],
  isDegraded: (cellId: string): boolean => (_registry.get(cellId)?.confidenceScore ?? 100) < 80,
};
