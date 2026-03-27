import { EventBus } from "@/core/events/event-bus";
// ── production-smartlink.port.ts ────────────────────────────
export interface ProductionSignal {
  type: "PRODUCTION_STARTED" | "PRODUCTION_COMPLETED" | "WEIGHT_ANOMALY" | "MATERIAL_LOSS";
  payload: Record<string, unknown>;
  timestamp: number;
}

const PRODUCTION_MAP: Record<string, string> = {
  "PRODUCTION_STARTED":    "ProductionStarted",
  "PRODUCTION_COMPLETED":  "ProductionCompleted",
  "WEIGHT_ANOMALY":        "WeightAnomaly",
  "MATERIAL_LOSS":         "MaterialLossReported",
};

export function publishProductionSignal(signal: ProductionSignal): void {
  EventBus.emit(PRODUCTION_MAP[signal.type] ?? signal.type, { ...signal.payload, timestamp: signal.timestamp });
}

// ────────────────────────────────────────────────────────────
