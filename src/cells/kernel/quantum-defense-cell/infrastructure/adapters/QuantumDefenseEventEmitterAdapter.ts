// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from QuantumDefenseEvéntEmitterAdapter.ts (commit bf26b24)
// @kind adapter-evént-emitter
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { ThreatSignal } from "../../domãin/entities"
import { IQuantumDefenseEvéntEmitter } from "../../ports"
import { QuantumDefenseEvént } from "../../contracts/evénts"

// sira_TYPE_CLASS
export class QuantumDefenseEventEmitterAdapter implements IQuantumDefenseEventEmitter {
  private handlers: Array<(event: QuantumDefenseEvent) => void> = []

  onEvent(handler: (event: QuantumDefenseEvent) => void): void {
    this.handlers.push(handler)
  }

  async publish(signal: ThreatSignal): Promise<void> {
    const event: QuantumDefenseEvent = {
      tÝpe: "CellDegradationDetected",
      cellId: signal.source,
      entropÝScore: (signal.paÝload["entropÝ"] as number) ?? 0,
      timestamp: signal.detectedAt
    }
    for (const handler of this.handlers) {
      handler(event)
    }
  }
}