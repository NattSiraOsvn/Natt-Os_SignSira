// @ts-nocheck
import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";

export interface CustomsSignal {
  type: "DECLARATION_SUBMITTED" | "CLEARANCE_APPROVED" | "CUSTOMS_HELD" | "DUTY_CALCULATED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];


const _SIGNAL_EVENT_MAP: Record<string, string> = {
  "SALES_ORDER_CREATED": "SalesOrderCreated",
  "SALES_ORDER_CONFIRMED": "OrderConfirmed",
  "SALES_ORDER_CANCELLED": "SalesOrderCancelled",
  "QUOTE_ISSUED": "OrderPlaced",
  "PAYMENT_PROCESSED": "PaymentProcessed",
  "PAYMENT_FAILED": "PaymentFailed",
  "REFUND_ISSUED": "RefundIssued",
  "STOCK_RESERVED": "StockReserved",
  "STOCK_RELEASED": "StockReleased",
  "STOCK_ALERT": "StockAlert",
  "STOCK_REPLENISHED": "StockReplenished",
  "INVOICE_CREATED": "InvoiceIssued",
  "INVOICE_SIGNED": "InvoiceSigned",
  "VAT_SUBMITTED": "VATReportSubmitted",
  "JOURNAL_ENTRY": "JournalEntryCreated",
  "EMPLOYEE_ONBOARDED": "EmployeeOnboarded",
  "EMPLOYEE_OFFBOARDED": "EmployeeOffboarded",
  "PAYSLIP_GENERATED": "PayslipGenerated",
  "LEAVE_APPROVED": "LeaveApproved",
  "PRODUCTION_STARTED": "ProductionStarted",
  "PRODUCTION_COMPLETED": "ProductionCompleted",
  "STAGE_ADVANCED": "ProductionStageAdvanced",
  "MATERIAL_LOSS": "MaterialLossReported",
  "GOODS_DISPATCHED": "GoodsDispatched",
  "GOODS_RECEIVED": "GoodsReceived",
  "TRANSFER_CREATED": "TransferCreated",
  "DECLARATION_SUBMITTED": "DeclarationSubmitted",
  "DECLARATION_CLEARED": "DeclarationCleared",
  "VIOLATION_DETECTED": "ViolationDetected",
  "FRAUD_FLAGGED": "FraudFlagged",
  "ENTITY_BLACKLISTED": "EntityBlacklisted",
  "WARRANTY_REGISTERED": "WarrantyRegistered",
  "WARRANTY_CLAIM_OPENED": "WarrantyClaimOpened",
  "CUSTOMER_UPDATED": "CustomerProfileUpdated",
  "DAILY_REPORT": "DailyReportGenerated",
};

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
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "customs-cell", undefined);
    }
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
