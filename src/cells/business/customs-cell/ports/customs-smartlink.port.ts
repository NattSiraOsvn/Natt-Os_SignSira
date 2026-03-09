import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface CustomsSignal {
  type: "DECLARATION_SUBMITTED" | "CLEARANCE_APPROVED" | "CUSTOMS_HELD" | "DUTY_CALCULATED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const CustomsSmartLinkPort = {
  emit: (signal: CustomsSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "customs-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[CUSTOMS SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyDeclarationSubmitted: (declarationId: string): void =>
    CustomsSmartLinkPort.emit({ type: "DECLARATION_SUBMITTED", payload: { declarationId: declarationId }, timestamp: Date.now() }),
  notifyClearanceApproved: (declarationId: string): void =>
    CustomsSmartLinkPort.emit({ type: "CLEARANCE_APPROVED", payload: { declarationId: declarationId }, timestamp: Date.now() }),
  notifyCustomsHeld: (declarationId: string, reason: string): void =>
    CustomsSmartLinkPort.emit({ type: "CUSTOMS_HELD", payload: { declarationId: declarationId, reason: reason }, timestamp: Date.now() }),
  notifyDutyCalculated: (declarationId: string, amount: number): void =>
    CustomsSmartLinkPort.emit({ type: "DUTY_CALCULATED", payload: { declarationId: declarationId, amount: amount }, timestamp: Date.now() }),
};

function _routeSignal(type: CustomsSignal["type"]): string {
  const routes: Record<string, string> = {
    "DECLARATION_SUBMITTED": "audit-cell",
    "CLEARANCE_APPROVED": "warehouse-cell",
    "CUSTOMS_HELD": "compliance-cell",
    "DUTY_CALCULATED": "finance-cell",
  };
  return routes[type] ?? "audit-cell";
}
