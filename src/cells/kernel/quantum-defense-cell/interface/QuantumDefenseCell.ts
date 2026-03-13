// @ts-nocheck
import { QuantumDefenseEngine } from "../domain/services"
import { InMemoryThreatRepository } from "../infrastructure/repositories"
import { QuantumDefenseEventEmitterAdapter } from "../infrastructure/adapters"
import { QuantumDefenseApplicationService } from "../application/services"
import { IQuantumDefenseCell } from "../ports"
import { ImmuneState, ImmuneLevel } from "../domain/entities"
import { QuantumDefenseEvent } from "../contracts/events"

export class QuantumDefenseCell implements IQuantumDefenseCell {
  private service: QuantumDefenseApplicationService
  private engine: QuantumDefenseEngine
  readonly emitter: QuantumDefenseEventEmitterAdapter

  constructor() {
    this.engine  = new QuantumDefenseEngine()
    const repo   = new InMemoryThreatRepository()
    this.emitter = new QuantumDefenseEventEmitterAdapter()
    this.service = new QuantumDefenseApplicationService(this.engine, repo, this.emitter)
  }

  async onEvent(envelope: { type: string; source?: string; payload?: Record<string, unknown> }): Promise<void> {
    await this.service.onEvent(envelope)
  }

  getImmuneState(): ImmuneState {
    return this.service.getImmuneState()
  }

  async forceOmegaLock(reason: string): Promise<void> {
    console.warn(`[quantum-defense-cell] OMEGA_LOCK forced — reason: ${reason}`)
    const events = this.engine.forceOmegaLock()
    for (const handler of (this.emitter as any).handlers) {
      for (const e of events) handler(e)
    }
  }

  async gatekeeperOverride(action: "BYPASS" | "FORCE_LOCK"): Promise<void> {
    if (action === "FORCE_LOCK") await this.forceOmegaLock("gatekeeper-override")
    else console.info("[quantum-defense-cell] BYPASS granted by Gatekeeper")
  }
}
