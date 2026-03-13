// @ts-nocheck
import { ImmuneLevel, ImmuneState } from "../entities"
import { AiAgentBlocked } from "../../contracts/events"

export class AiFirewallEngine {
  private coherence: number = 1.0

  updateCoherence(cpm: number): void {
    // Bot/AI = no CPM → coherence = 0
    this.coherence = cpm > 0 ? Math.min(1.0, cpm / 300) : 0
  }

  getCoherence(): number {
    return this.coherence
  }

  evaluate(): AiAgentBlocked | null {
    if (this.coherence === 0) {
      return {
        type: "AiAgentBlocked",
        requestId: `req-${Date.now()}`,
        coherence: 0,
        action: "OMEGA_LOCK"
      }
    }
    return null
  }
}
