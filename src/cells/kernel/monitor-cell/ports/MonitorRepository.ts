// @ts-nocheck
import type { CellHealth } from "../domain/entities/cell-health.entity";

export interface IMonitorRepository {
  save(health: CellHealth): Promise<CellHealth>;
  findByCellId(cellId: string): Promise<CellHealth | null>;
  findAll(): Promise<CellHealth[]>;
  findDegraded(): Promise<CellHealth[]>;
  findByWave(wave: 1|2|3): Promise<CellHealth[]>;
}
