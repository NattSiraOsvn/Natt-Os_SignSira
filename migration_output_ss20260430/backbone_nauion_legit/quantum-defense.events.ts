import { ImmuneLevel } from "../../domain/entities"

export interface CellDegradationDetected {
  type: "CellDegradationDetected"
  cellId: string
  entropyScore: number
  timestamp: number
}

export interface CellRegenerationRequired {
  type: "CellRegenerationRequired"
  cellId: string
  reason: string
  urgency: ImmuneLevel
}

export interface CellIsolationRequired {
  type: "CellIsolationRequired"
  cellId: string
  threatLevel: ImmuneLevel
  source: string
}

export interface ViolationDetected {
  type: "ViolationDetected"
  article: string
  pattern: string
  eventChain: string[]
}

export interface AiAgentBlocked {
  type: "AiAgentBlocked"
  requestId: string
  coherence: 0
  action: "OMEGA_LOCK"
}

export interface EntropyAlert {
  type: "EntropyAlert"
  level: ImmuneLevel
  entropy: number
  windowMs: number
}

export interface ImmuneResponseEscalated {
  type: "ImmuneResponseEscalated"
  from: ImmuneLevel
  to: ImmuneLevel
}

export type QuantumDefenseEvent =
  | CellDegradationDetected
  | CellRegenerationRequired
  | CellIsolationRequired
  | ViolationDetected
  | AiAgentBlocked
  | EntropyAlert
  | ImmuneResponseEscalated
