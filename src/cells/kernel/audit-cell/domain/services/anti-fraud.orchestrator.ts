 — TODO: fix type errors, remove this pragma

import { EventBus } from "../../../../../core/events/event-bus";
import { AuditSmartLinkPort } from "../../ports/audit-smartlink.port";

export class AntiFraudOrchestrator {
  private riskScore = 0;
  constructor() {
    this.subscribe();
  }
  private subscribe() {
    EventBus.subscribe("LowPhoDetected", () => this.riskScore += 30);
    EventBus.subscribe("DiamondLossDetected", () => this.riskScore += 50);
    EventBus.subscribe("WeightAnomaly", () => this.riskScore += 20);
    EventBus.subscribe("MaterialRetained", () => this.riskScore += 10);
    EventBus.subscribe("DustShortfall", () => this.riskScore += 25);
    setInterval(() => this.evaluate(), 60000);
  }
  private evaluate() {
    if (this.riskScore >= 80) {
      AuditSmartLinkPort.emit("FRAUD_ALERT", { level: "HIGH", score: this.riskScore });
      this.riskScore = 0;
    }
  }
}
export const orchestrator = new AntiFraudOrchestrator();
