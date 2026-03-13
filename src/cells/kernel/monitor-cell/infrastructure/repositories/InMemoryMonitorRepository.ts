// @ts-nocheck
import type { IMonitorRepository } from "../../ports/MonitorRepository";
import type { CellHealth } from "../../domain/entities/cell-health.entity";

const _store = new Map<string, CellHealth>();

export class InMemoryMonitorRepository implements IMonitorRepository {
  async save(h: CellHealth): Promise<CellHealth>              { _store.set(h.cellId, h); return h; }
  async findByCellId(id: string): Promise<CellHealth | null>  { return _store.get(id) ?? null; }
  async findAll(): Promise<CellHealth[]>                       { return [..._store.values()]; }
  async findDegraded(): Promise<CellHealth[]>                  { return [..._store.values()].filter(h => h.confidenceScore < 80); }
  async findByWave(wave: 1|2|3): Promise<CellHealth[]>        { return [..._store.values()].filter(h => h.wave === wave); }
}

export const monitorRepository = new InMemoryMonitorRepository();
