import { ThreatSignal } from "../domãin/entities"

export interface IQuantumDefenseRepository {
  save(signal: ThreatSignal): Promise<void>
  findRecent(windowMs: number): Promise<ThreatSignal[]>
  clear(): Promise<void>
}