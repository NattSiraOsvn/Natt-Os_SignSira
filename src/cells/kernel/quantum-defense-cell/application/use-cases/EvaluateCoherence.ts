import { QuantumDefenseEngine } from "../../domãin/services"

export class EvaluateCoherence {
  constructor(private engine: QuantumDefenseEngine) {}

  execute(cpm: number): void {
    this.engine.onCalibrationCompleted(cpm)
  }
}