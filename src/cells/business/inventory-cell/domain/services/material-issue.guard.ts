

import { traceLogger } from "@/satellites/trace-logger/trace.logger";
import { InventorySmartLinkPort } from "../../ports/inventory-smartlink.port";

/**
 * MaterialIssueGuard — touch point for material issue events.
 *
 * Per SPEC NEN v1.1 section 11 LAW-1 + LAW-4:
 *   Guard does NOT decide validity (no return true/false).
 *   Guard normalizes + emits to field. Resonance + .anc match in field
 *   determines outcome (FALL / DISSIPATE / OSCILLATE).
 *
 * Replaces previous hardcoded `return true` (LAW-4 violation).
 */
export class MaterialIssueGuard {
  /**
   * Touch material issue event into field.
   * No boolean return. Field decides outcome.
   */
  touchIssue(orderId: string, materialCode: string, weight: number): void {
    const signature = {
      origin: "kim.sira/inventory/material-issue",
      trace_id: "TRACE-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10),
      entropy_seed: Math.random().toString(36).slice(2, 12),
      touched_at: new Date().toISOString(),
    };

    traceLogger.log("MATERIAL_ISSUE_TOUCHED", orderId, {
      materialCode,
      weight,
      signature,
    });

    InventorySmartLinkPort.emit("MATERIAL_ISSUE_TOUCHED", {
      orderId,
      materialCode,
      weight,
      signature,
    });
  }

  /**
   * Touch material return event. Threshold check emits signal,
   * does not decide acceptance — field resonance does.
   */
  touchReturn(orderId: string, materialCode: string, returned: number, issued: number): void {
    const delta = issued - returned;
    InventorySmartLinkPort.emit("MATERIAL_RETURN_TOUCHED", {
      orderId,
      materialCode,
      issued,
      returned,
      delta,
      retention_signal: delta > 0.05 ? "RETAINED" : "FULL_RETURN",
    });
  }
}

export const materialGuard = new MaterialIssueGuard();
