// @ts-nocheck
import { EventBus } from "@/core/events/event-bus";
import { ProductionSmartLinkPort } from "../../ports/production-smartlink.port";

export class WeightGuardEngine {
  recordWeighing(orderId: string, workerId: string, weightIn: number, weightOut: number) {
    if (weightOut > weightIn + 0.02) {
      ProductionSmartLinkPort.emit("WEIGHT_ANOMALY", { orderId, workerId, weightIn, weightOut });
    }
  }
}
export const weightGuard = new WeightGuardEngine();
