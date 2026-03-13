// @ts-nocheck
import { QuantumDefenseEngine } from "../../domain/services"

export class EvaluateCoherence {
  constructor(private engine: QuantumDefenseEngine) {}

  execute(cpm: number): void {
    this.engine.onCalibrationCompleted(cpm)
  }
}
