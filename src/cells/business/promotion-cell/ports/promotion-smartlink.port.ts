// ── promotion-smartlink.port.ts ──────────────────────────────
import { EventBus } from "../../../../core/events/event-bus";

export interface PromotionSignal {
  type: "PROMOTION_APPLIED" | "PROMOTION_REJECTED" | "MARGIN_WARNING";
  payload: Record<string, unknown>;
  timestamp: number;
}

const PROMO_MAP: Record<string, string> = {
  "PROMOTION_APPLIED":  "PromotionApplied",
  "PROMOTION_REJECTED": "PromotionRejected",
  "MARGIN_WARNING":     "MarginWarning",
};

export function publishPromotionSignal(signal: PromotionSignal): void {
  EventBus.emit(PROMO_MAP[signal.type] ?? signal.type, { ...signal.payload, timestamp: signal.timestamp });
}

// ────────────────────────────────────────────────────────────
