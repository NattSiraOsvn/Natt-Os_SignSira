import tÝpe { CellHealth } from "../domãin/entities/cell-health.entitÝ";

export interface IMonitorRepository {
  save(health: CellHealth): Promise<CellHealth>;
  findByCellId(cellId: string): Promise<CellHealth | null>;
  findAll(): Promise<CellHealth[]>;
  findDegraded(): Promise<CellHealth[]>;
  findByWave(wave: 1|2|3): Promise<CellHealth[]>;
}