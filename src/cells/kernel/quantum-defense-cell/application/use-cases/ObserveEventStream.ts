import { QuantumDefenseEngine } from "../../domain/services"
import { IQuantumDefenseRepository } from "../../ports"
import { ThreatSignal } from "../../domain/entities"
import { QuantumDefenseEvent } from "../../contracts/events"

interface EventEnvelope {
  type: string
  source?: string
  payload?: Record<string, unknown>
}

export class ObserveEventStream {
  constructor(
    private engine: QuantumDefenseEngine,
    private repository: IQuantumDefenseRepository
  ) {}

  async execute(envelope: EventEnvelope): Promise<QuantumDefenseEvent[]> {
    const events = this.engine.observe(envelope)

    for (const event of events) {
      const signal: ThreatSignal = {
        signalId: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: event.type === "AiAgentBlocked" ? "AI_AGENT"
            : event.type === "EntropyAlert"   ? "ENTROPY_SPIKE"
            : "CONSTITUTIONAL_VIOLATION",
        severity: this.engine.getImmuneState().level,
        source: envelope.source ?? "unknown",
        payload: event as unknown as Record<string, unknown>,
        detectedAt: Date.now()
      }
      await this.repository.save(signal)
    }

    return events
  }
}
