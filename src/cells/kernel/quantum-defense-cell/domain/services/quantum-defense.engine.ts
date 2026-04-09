// @ts-nocheck — TODO: fix type errors, remove this pragma

import { AiFirewallEngine } from "./ai-firewall.engine"
import { SensitivityRadarEngine } from "./sensitivity-radar.engine"
import { ConstitutionalEnforcerEngine } from "./constitutional-enforcer.engine"
import { ImmuneResponseEngine } from "./immune-response.engine"
import { ImmuneState } from "../entities"
import { QuantumDefenseEvent } from "../../contracts/events"

interface EventEnvelope {
  type: string
  source?: string
  payload?: Record<string, unknown>
}

export class QuantumDefenseEngine {
  private firewall = new AiFirewallEngine()
  private radar = new SensitivityRadarEngine()
  private enforcer = new ConstitutionalEnforcerEngine()
  private immune = new ImmuneResponseEngine()

  onCalibrationCompleted(cpm: number): void {
    this.firewall.updateCoherence(cpm)
  }

  observe(envelope: EventEnvelope): QuantumDefenseEvent[] {
    const events: QuantumDefenseEvent[] = []

    this.radar.record(envelope.type)
    this.enforcer.observe(envelope)

    const entropy = this.radar.calculateEntropy()
    const coherence = this.firewall.getCoherence()

    // CN1 — AI Firewall
    const blocked = this.firewall.evaluate()
    if (blocked) events.push(blocked)

    // CN2 — Sensitivity Radar
    const entropyAlert = this.radar.evaluate()
    if (entropyAlert) events.push(entropyAlert)

    // CN3 — Constitutional Enforcement
    const violation = this.enforcer.evaluate()
    if (violation) events.push(violation)

    // CN4 — Graduated Immune Response
    const escalation = this.immune.escalate(entropy, coherence)
    if (escalation) events.push(escalation)

    return events
  }

  getImmuneState(): ImmuneState {
    return this.immune.getState()
  }

  forceOmegaLock(): QuantumDefenseEvent[] {
    const state = this.immune.getState()
    return [
      this.immune.buildIsolationEvent("system"),
      { type: "AiAgentBlocked", requestId: `force-${Date.now()}`, coherence: 0, action: "OMEGA_LOCK" }
    ]
  }
}
