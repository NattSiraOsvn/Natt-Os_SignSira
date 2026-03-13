// @ts-nocheck
import { EventBus } from "@/core/events/event-bus";
import { StoneSmartLinkPort } from "../../ports/stone-smartlink.port";

export class DiamondGuardEngine {
  checkOrder(orderId: string, bomCount: number, actualCount: number) {
    if (actualCount < bomCount * 0.98) {
      StoneSmartLinkPort.emit("DIAMOND_LOSS", { orderId, bomCount, actualCount, loss: bomCount - actualCount });
    }
  }
}
export const diamondGuard = new DiamondGuardEngine();
