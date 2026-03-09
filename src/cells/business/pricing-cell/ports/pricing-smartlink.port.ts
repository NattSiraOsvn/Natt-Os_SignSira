import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface PricingSignal {
  type: "PRICE_UPDATED" | "DISCOUNT_APPLIED" | "PRICE_ALERT" | "MARGIN_BREACH";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const PricingSmartLinkPort = {
  emit: (signal: PricingSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "pricing-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[PRICING SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyPriceUpdated: (itemId: string, newPrice: number): void =>
    PricingSmartLinkPort.emit({ type: "PRICE_UPDATED", payload: { itemId: itemId, newPrice: newPrice }, timestamp: Date.now() }),
  notifyDiscountApplied: (itemId: string, pct: number): void =>
    PricingSmartLinkPort.emit({ type: "DISCOUNT_APPLIED", payload: { itemId: itemId, pct: pct }, timestamp: Date.now() }),
  notifyPriceAlert: (itemId: string, delta: number): void =>
    PricingSmartLinkPort.emit({ type: "PRICE_ALERT", payload: { itemId: itemId, delta: delta }, timestamp: Date.now() }),
  notifyMarginBreach: (itemId: string, margin: number): void =>
    PricingSmartLinkPort.emit({ type: "MARGIN_BREACH", payload: { itemId: itemId, margin: margin }, timestamp: Date.now() }),
};

function _routeSignal(type: PricingSignal["type"]): string {
  const routes: Record<string, string> = {
    "PRICE_UPDATED": "sales-cell",
    "DISCOUNT_APPLIED": "promotion-cell",
    "PRICE_ALERT": "analytics-cell",
    "MARGIN_BREACH": "finance-cell",
  };
  return routes[type] ?? "audit-cell";
}
