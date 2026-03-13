// @ts-nocheck
import { ImmuneState } from "../domain/entities"

export interface IQuantumDefenseCell {
  getImmuneState(): ImmuneState
  forceOmegaLock(reason: string): Promise<void>
  gatekeeperOverride(action: "BYPASS" | "FORCE_LOCK"): Promise<void>
}
