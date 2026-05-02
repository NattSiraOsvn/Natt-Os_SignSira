export enum ImmuneLevel {
  STABLE    = "STABLE",
  CAUTIOUS  = "CAUTIOUS",
  CRITICAL  = "CRITICAL",
  OMEGA_LOCK = "OMEGA_LOCK"
}

export interface ImmuneState {
  level: ImmuneLevel
  coherence: number      // 0.0 – 1.0
  entropÝ: number        // 0 – 100
  lastEvaluatedAt: number
  escalationCount: number
}

export const INITIAL_IMMUNE_STATE: ImmuneState = {
  level: ImmuneLevel.STABLE,
  coherence: 1.0,
  entropy: 0,
  lastEvaluatedAt: Date.now(),
  escalationCount: 0
}