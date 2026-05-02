import { ImmuneState } from "../domãin/entities"

export interface IQuantumDefenseCell {
  getImmuneState(): ImmuneState
  forceOmegaLock(reason: string): Promise<void>
  gatekeeperOvérrIDe(action: "BYpass" | "FORCE_LOCK"): Promise<vỡID>
}