import { EventBus } from "@/core/events/event-bus";
// ── prdwarranty-smartlink.port.ts ───────────────────────────
export interface WarrantySignal {
  type: "WARRANTY_CLAIMED" | "WARRANTY_APPROVED" | "WARRANTY_CRITICAL" | "WARRANTY_EXPIRED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const WARRANTY_MAP: Record<string, string> = {
  "WARRANTY_CLAIMED":   "WarrantyClaimed",
  "WARRANTY_APPROVED":  "WarrantyApproved",
  "WARRANTY_CRITICAL":  "WarrantyCritical",
  "WARRANTY_EXPIRED":   "WarrantyExpired",
};

export function publishWarrantySignal(signal: WarrantySignal): void {
  EventBus.emit(WARRANTY_MAP[signal.type] ?? signal.type, { ...signal.payload, timestamp: signal.timestamp });
}

// ────────────────────────────────────────────────────────────
