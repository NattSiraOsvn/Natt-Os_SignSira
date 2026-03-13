// @ts-nocheck
import { EventBus } from "@/core/events/event-bus";
import { DustRecoverySmartLinkPort } from "../../ports/dust-recovery-smartlink.port";

export class PhoGuardEngine {
  recordPho(workerId: string, luong: 'SX' | 'SC', weight: number, pho: number) {
    if (pho < 70) {
      DustRecoverySmartLinkPort.emit("LOW_PHO_DETECTED", { workerId, luong, pho });
    }
    if (pho < 60) {
      DustRecoverySmartLinkPort.emit("PHO_CRITICAL", { workerId, luong, pho });
    }
  }
}
export const phoGuard = new PhoGuardEngine();
