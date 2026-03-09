import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface WarrantySignal {
  type: "WARRANTY_REGISTERED" | "CLAIM_SUBMITTED" | "CLAIM_APPROVED" | "WARRANTY_EXPIRED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const WarrantySmartLinkPort = {
  emit: (signal: WarrantySignal): void => {
    const touch: TouchRecord = {
      fromCellId: "warranty-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[WARRANTY SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyWarrantyRegistered: (itemId: string, customerId: string): void =>
    WarrantySmartLinkPort.emit({ type: "WARRANTY_REGISTERED", payload: { itemId: itemId, customerId: customerId }, timestamp: Date.now() }),
  notifyClaimSubmitted: (claimId: string, itemId: string): void =>
    WarrantySmartLinkPort.emit({ type: "CLAIM_SUBMITTED", payload: { claimId: claimId, itemId: itemId }, timestamp: Date.now() }),
  notifyClaimApproved: (claimId: string): void =>
    WarrantySmartLinkPort.emit({ type: "CLAIM_APPROVED", payload: { claimId: claimId }, timestamp: Date.now() }),
  notifyWarrantyExpired: (itemId: string): void =>
    WarrantySmartLinkPort.emit({ type: "WARRANTY_EXPIRED", payload: { itemId: itemId }, timestamp: Date.now() }),
};

function _routeSignal(type: WarrantySignal["type"]): string {
  const routes: Record<string, string> = {
    "WARRANTY_REGISTERED": "customer-cell",
    "CLAIM_SUBMITTED": "compliance-cell",
    "CLAIM_APPROVED": "production-cell",
    "WARRANTY_EXPIRED": "analytics-cell",
  };
  return routes[type] ?? "audit-cell";
}
