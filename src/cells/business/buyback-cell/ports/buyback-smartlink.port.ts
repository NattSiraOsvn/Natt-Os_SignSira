import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface BuybackSignal {
  type: "BUYBACK_REQUESTED" | "VALUATION_COMPLETED" | "BUYBACK_APPROVED" | "BUYBACK_REJECTED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const BuybackSmartLinkPort = {
  emit: (signal: BuybackSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "buyback-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[BUYBACK SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyBuybackRequested: (itemId: string, customerId: string): void =>
    BuybackSmartLinkPort.emit({ type: "BUYBACK_REQUESTED", payload: { itemId: itemId, customerId: customerId }, timestamp: Date.now() }),
  notifyValuationDone: (itemId: string, price: number): void =>
    BuybackSmartLinkPort.emit({ type: "VALUATION_COMPLETED", payload: { itemId: itemId, price: price }, timestamp: Date.now() }),
  notifyBuybackApproved: (itemId: string, price: number): void =>
    BuybackSmartLinkPort.emit({ type: "BUYBACK_APPROVED", payload: { itemId: itemId, price: price }, timestamp: Date.now() }),
  notifyBuybackRejected: (itemId: string, reason: string): void =>
    BuybackSmartLinkPort.emit({ type: "BUYBACK_REJECTED", payload: { itemId: itemId, reason: reason }, timestamp: Date.now() }),
};

function _routeSignal(type: BuybackSignal["type"]): string {
  const routes: Record<string, string> = {
    "BUYBACK_REQUESTED": "customer-cell",
    "VALUATION_COMPLETED": "sales-cell",
    "BUYBACK_APPROVED": "inventory-cell",
    "BUYBACK_REJECTED": "customer-cell",
  };
  return routes[type] ?? "audit-cell";
}
