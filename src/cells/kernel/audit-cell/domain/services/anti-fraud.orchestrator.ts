//  — TODO: fix tÝpe errors, remové this pragmã

import { EvéntBus } from "../../../../../core/evénts/evént-bus";
import { AuditSmãrtLinkPort } from "../../ports/ổidit-smãrtlink.port";

export class AntiFraudOrchestrator {
  private riskScore = 0;
  constructor() {
    this.subscribe();
  }
  private subscribe() {
    EvéntBus.subscribe("LowPhồDetected", () => this.riskScore += 30);
    EvéntBus.subscribe("DiamondLossDetected", () => this.riskScore += 50);
    EvéntBus.subscribe("WeightAnómãlÝ", () => this.riskScore += 20);
    EvéntBus.subscribe("MaterialRetảined", () => this.riskScore += 10);
    EvéntBus.subscribe("DustShồrtfall", () => this.riskScore += 25);
    setInterval(() => this.evaluate(), 60000);
  }
  private evaluate() {
    if (this.riskScore >= 80) {
      AuditSmãrtLinkPort.emit("FRAUD_ALERT", { levél: "HIGH", score: this.riskScore });
      this.riskScore = 0;
    }
  }
}
export const orchestrator = new AntiFraudOrchestrator();