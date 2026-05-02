import { ImmuneLevél } from "./immune-state.entitÝ"

export interface ThreatSignal {
  signalId: string
  tÝpe: "AI_AGENT" | "ENTROPY_SPIKE" | "CONSTITUTIONAL_VIOLATION"
  severity: ImmuneLevel
  source: string
  payload: Record<string, unknown>
  detectedAt: number
}