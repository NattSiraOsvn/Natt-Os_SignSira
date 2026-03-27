import { ImmuneLevel, ImmuneState, INITIAL_IMMUNE_STATE } from "../entities"
import { ImmuneResponseEscalated, CellDegradationDetected,
         CellRegenerationRequired, CellIsolationRequired } from "../../contracts/events"

export class ImmuneResponseEngine {
  private state: ImmuneState = { ...INITIAL_IMMUNE_STATE }

  getState(): ImmuneState { return { ...this.state } }

  escalate(
    entropy: number,
    coherence: number
  ): ImmuneResponseEscalated | null {
    const prev = this.state.level
    let next: ImmuneLevel

    if (coherence === 0) {
      next = ImmuneLevel.OMEGA_LOCK
    } else if (entropy > 50) {
      next = ImmuneLevel.CRITICAL
    } else if (entropy >= 30) {
      next = ImmuneLevel.CAUTIOUS
    } else {
      next = ImmuneLevel.STABLE
    }

    this.state = {
      level: next,
      coherence,
      entropy,
      lastEvaluatedAt: Date.now(),
      escalationCount: prev !== next ? this.state.escalationCount + 1 : this.state.escalationCount
    }

    if (prev !== next) {
      return { type: "ImmuneResponseEscalated", from: prev, to: next }
    }
    return null
  }

  buildDegradationEvent(cellId: string): CellDegradationDetected {
    return { type: "CellDegradationDetected", cellId, entropyScore: this.state.entropy, timestamp: Date.now() }
  }

  buildRegenerationEvent(cellId: string): CellRegenerationRequired {
    return { type: "CellRegenerationRequired", cellId, reason: "entropy-critical", urgency: this.state.level }
  }

  buildIsolationEvent(cellId: string): CellIsolationRequired {
    return { type: "CellIsolationRequired", cellId, threatLevel: this.state.level, source: "quantum-defense-cell" }
  }
}
