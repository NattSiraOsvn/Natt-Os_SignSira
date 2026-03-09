import { QuantumDefenseEvent } from "../../contracts/events"
import { IQuantumDefenseEventEmitter } from "../../ports"
import { ThreatSignal, ImmuneLevel } from "../../domain/entities"

export class PublishImmuneResponse {
  constructor(private emitter: IQuantumDefenseEventEmitter) {}

  async execute(events: QuantumDefenseEvent[]): Promise<void> {
    for (const event of events) {
      const signal: ThreatSignal = {
        signalId: `pub-${Date.now()}`,
        type: "ENTROPY_SPIKE",
        severity: ImmuneLevel.CAUTIOUS,
        source: "quantum-defense-cell",
        payload: event as unknown as Record<string, unknown>,
        detectedAt: Date.now()
      }
      await this.emitter.publish(signal)
    }
  }
}
