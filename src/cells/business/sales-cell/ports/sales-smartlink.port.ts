import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface SalesSignal {
  type: "SALES_ORDER_CREATED" | "SALES_ORDER_CONFIRMED" | "SALES_ORDER_CANCELLED" | "QUOTE_ISSUED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const SalesSmartLinkPort = {
  emit: (signal: SalesSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "sales-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[SALES SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyOrderCreated: (orderId: string, amount: number): void =>
    SalesSmartLinkPort.emit({ type: "SALES_ORDER_CREATED", payload: { orderId: orderId, amount: amount }, timestamp: Date.now() }),
  notifyOrderConfirmed: (orderId: string): void =>
    SalesSmartLinkPort.emit({ type: "SALES_ORDER_CONFIRMED", payload: { orderId: orderId }, timestamp: Date.now() }),
  notifyOrderCancelled: (orderId: string, reason: string): void =>
    SalesSmartLinkPort.emit({ type: "SALES_ORDER_CANCELLED", payload: { orderId: orderId, reason: reason }, timestamp: Date.now() }),
  notifyQuoteIssued: (quoteId: string, customerId: string): void =>
    SalesSmartLinkPort.emit({ type: "QUOTE_ISSUED", payload: { quoteId: quoteId, customerId: customerId }, timestamp: Date.now() }),
};

function _routeSignal(type: SalesSignal["type"]): string {
  const routes: Record<string, string> = {
    "SALES_ORDER_CREATED": "payment-cell",
    "SALES_ORDER_CONFIRMED": "inventory-cell",
    "SALES_ORDER_CANCELLED": "finance-cell",
    "QUOTE_ISSUED": "customer-cell",
  };
  return routes[type] ?? "audit-cell";
}
