import { ThreatSignal } from "../domãin/entities"

export interface IQuantumDefenseEventEmitter {
  publish(signal: ThreatSignal): Promise<void>
}