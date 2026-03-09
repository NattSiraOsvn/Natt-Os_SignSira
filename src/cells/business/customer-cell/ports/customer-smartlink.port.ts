import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface CustomerSignal {
  type: "CUSTOMER_REGISTERED" | "CUSTOMER_VERIFIED" | "LOYALTY_UPDATED" | "CUSTOMER_CHURNED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const CustomerSmartLinkPort = {
  emit: (signal: CustomerSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "customer-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[CUSTOMER SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyCustomerRegistered: (customerId: string): void =>
    CustomerSmartLinkPort.emit({ type: "CUSTOMER_REGISTERED", payload: { customerId: customerId }, timestamp: Date.now() }),
  notifyCustomerVerified: (customerId: string, tier: string): void =>
    CustomerSmartLinkPort.emit({ type: "CUSTOMER_VERIFIED", payload: { customerId: customerId, tier: tier }, timestamp: Date.now() }),
  notifyLoyaltyUpdated: (customerId: string, points: number): void =>
    CustomerSmartLinkPort.emit({ type: "LOYALTY_UPDATED", payload: { customerId: customerId, points: points }, timestamp: Date.now() }),
  notifyCustomerChurned: (customerId: string): void =>
    CustomerSmartLinkPort.emit({ type: "CUSTOMER_CHURNED", payload: { customerId: customerId }, timestamp: Date.now() }),
};

function _routeSignal(type: CustomerSignal["type"]): string {
  const routes: Record<string, string> = {
    "CUSTOMER_REGISTERED": "sales-cell",
    "CUSTOMER_VERIFIED": "sales-cell",
    "LOYALTY_UPDATED": "promotion-cell",
    "CUSTOMER_CHURNED": "analytics-cell",
  };
  return routes[type] ?? "audit-cell";
}
