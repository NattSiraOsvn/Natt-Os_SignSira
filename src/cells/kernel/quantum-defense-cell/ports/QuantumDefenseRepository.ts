// @ts-nocheck
import { ThreatSignal } from "../domain/entities"

export interface IQuantumDefenseRepository {
  save(signal: ThreatSignal): Promise<void>
  findRecent(windowMs: number): Promise<ThreatSignal[]>
  clear(): Promise<void>
}
