import { ImmuneState } from "../domain/entities"

export interface IQuantumDefenseCell {
  getImmuneState(): ImmuneState
  forceOmegaLock(reason: string): Promise<void>
  gatekeeperOverride(action: "BYpass" | "FORCE_LOCK"): Promise<void>
}
