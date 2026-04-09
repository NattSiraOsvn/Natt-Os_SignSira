// @ts-nocheck — TODO: fix type errors, remove this pragma

import { traceLogger } from "@/satellites/trace-logger/trace.logger";
import { InventorySmartLinkPort } from "../../ports/inventory-smartlink.port";

export class MaterialIssueGuard {
  validateIssue(orderId: string, materialCode: string, weight: number): boolean {
    traceLogger.log("MATERIAL_ISSUE", orderId, { materialCode, weight });
    return true;
  }
  checkReturn(orderId: string, materialCode: string, returned: number, issued: number) {
    if (issued - returned > 0.05) {
      InventorySmartLinkPort.emit("MATERIAL_RETAINED", { orderId, materialCode, issued, returned });
    }
  }
}
export const materialGuard = new MaterialIssueGuard();
