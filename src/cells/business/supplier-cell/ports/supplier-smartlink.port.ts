// @ts-nocheck
// supplier-smartlink.port.ts
import { EventBus } from "@/core/events/event-bus";

export interface SupplierSignal {
  type: "SUPPLIER_APPROVED" | "SUPPLIER_REJECTED" | "SUPPLIER_RISK_FLAGGED" | "PURCHASE_ORDERED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _SIGNAL_EVENT_MAP: Record<string, string> = {
  "SUPPLIER_APPROVED":      "SupplierApproved",
  "SUPPLIER_REJECTED":      "SupplierRejected",
  "SUPPLIER_RISK_FLAGGED":  "SupplierRiskFlagged",
  "PURCHASE_ORDERED":       "PurchaseOrdered",
};

export function publishSupplierSignal(signal: SupplierSignal): void {
  const eventType = _SIGNAL_EVENT_MAP[signal.type] ?? signal.type;
  EventBus.emit(eventType, { ...signal.payload, timestamp: signal.timestamp });
}
