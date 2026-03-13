// @ts-nocheck
import { ThreatSignal } from "../../domain/entities"
import { IQuantumDefenseEventEmitter } from "../../ports"
import { QuantumDefenseEvent } from "../../contracts/events"

export class QuantumDefenseEventEmitterAdapter implements IQuantumDefenseEventEmitter {
  private handlers: Array<(event: QuantumDefenseEvent) => void> = []

  onEvent(handler: (event: QuantumDefenseEvent) => void): void {
    this.handlers.push(handler)
  }

  async publish(signal: ThreatSignal): Promise<void> {
    const event: QuantumDefenseEvent = {
      type: "CellDegradationDetected",
      cellId: signal.source,
      entropyScore: (signal.payload["entropy"] as number) ?? 0,
      timestamp: signal.detectedAt
    }
    for (const handler of this.handlers) {
      handler(event)
    }
  }
}
