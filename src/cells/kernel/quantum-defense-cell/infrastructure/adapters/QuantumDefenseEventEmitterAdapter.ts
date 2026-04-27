// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from QuantumDefenseEventEmitterAdapter.ts (commit bf26b24)
// @kind adapter-event-emitter
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { ThreatSignal } from "../../domain/entities"
import { IQuantumDefenseEventEmitter } from "../../ports"
import { QuantumDefenseEvent } from "../../contracts/events"

// sira_TYPE_CLASS
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
