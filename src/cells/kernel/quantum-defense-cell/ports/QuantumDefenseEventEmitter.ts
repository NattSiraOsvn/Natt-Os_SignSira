import { ThreatSignal } from "../domain/entities"

export interface IQuantumDefenseEventEmitter {
  publish(signal: ThreatSignal): Promise<void>
}
