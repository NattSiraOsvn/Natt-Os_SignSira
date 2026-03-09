import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface OrderSignal {
  type: "ORDER_PLACED" | "ORDER_FULFILLED" | "ORDER_RETURNED" | "ORDER_DISPUTED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const OrderSmartLinkPort = {
  emit: (signal: OrderSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "order-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[ORDER SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyOrderPlaced: (orderId: string, items: string[]): void =>
    OrderSmartLinkPort.emit({ type: "ORDER_PLACED", payload: { orderId: orderId, items: items }, timestamp: Date.now() }),
  notifyOrderFulfilled: (orderId: string): void =>
    OrderSmartLinkPort.emit({ type: "ORDER_FULFILLED", payload: { orderId: orderId }, timestamp: Date.now() }),
  notifyOrderReturned: (orderId: string, reason: string): void =>
    OrderSmartLinkPort.emit({ type: "ORDER_RETURNED", payload: { orderId: orderId, reason: reason }, timestamp: Date.now() }),
  notifyOrderDisputed: (orderId: string, disputeId: string): void =>
    OrderSmartLinkPort.emit({ type: "ORDER_DISPUTED", payload: { orderId: orderId, disputeId: disputeId }, timestamp: Date.now() }),
};

function _routeSignal(type: OrderSignal["type"]): string {
  const routes: Record<string, string> = {
    "ORDER_PLACED": "inventory-cell",
    "ORDER_FULFILLED": "sales-cell",
    "ORDER_RETURNED": "warehouse-cell",
    "ORDER_DISPUTED": "compliance-cell",
  };
  return routes[type] ?? "audit-cell";
}
