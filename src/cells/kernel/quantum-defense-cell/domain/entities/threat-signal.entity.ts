// @ts-nocheck
import { ImmuneLevel } from "./immune-state.entity"

export interface ThreatSignal {
  signalId: string
  type: "AI_AGENT" | "ENTROPY_SPIKE" | "CONSTITUTIONAL_VIOLATION"
  severity: ImmuneLevel
  source: string
  payload: Record<string, unknown>
  detectedAt: number
}
