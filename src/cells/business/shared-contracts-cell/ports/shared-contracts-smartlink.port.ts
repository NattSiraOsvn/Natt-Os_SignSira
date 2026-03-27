// @ts-nocheck
import { EventBus } from "@/core/events/event-bus";
// ── shared-contracts-smartlink.port.ts ──────────────────────
export interface ContractSignal {
  type: "CONTRACT_CREATED" | "CONTRACT_BREACHED" | "CONTRACT_COMPLETED" | "PAYMENT_DUE";
  payload: Record<string, unknown>;
  timestamp: number;
}

const CONTRACT_MAP: Record<string, string> = {
  "CONTRACT_CREATED":   "ContractCreated",
  "CONTRACT_BREACHED":  "ContractBreached",
  "CONTRACT_COMPLETED": "ContractCompleted",
  "PAYMENT_DUE":        "PaymentDue",
};

export function publishContractSignal(signal: ContractSignal): void {
  EventBus.emit(CONTRACT_MAP[signal.type] ?? signal.type, { ...signal.payload, timestamp: signal.timestamp });
}

// ────────────────────────────────────────────────────────────
// @ts-nocheck
