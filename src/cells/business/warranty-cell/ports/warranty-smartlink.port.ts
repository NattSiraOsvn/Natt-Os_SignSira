import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "../../../../core/events/event-bus";

export interface WarrantySignal {
  type: "WARRANTY_REGISTERED" | "CLAIM_SUBMITTED" | "CLAIM_APPROVED" | "WARRANTY_EXPIRED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];


const _SIGNAL_EVENT_MAP: Record<string, string> = {
  "SALES_ORDER_created": "SalesOrderCreated",
  "SALES_ORDER_CONFIRMED": "OrderConfirmed",
  "SALES_ORDER_CANCELLED": "SalesOrderCancelled",
  "QUOTE_ISSUED": "OrderPlaced",
  "PAYMENT_PROCESSED": "PaymentProcessed",
  "PAYMENT_failED": "PaymentFailed",
  "REFUND_ISSUED": "RefundIssued",
  "STOCK_RESERVED": "StockReserved",
  "STOCK_RELEASED": "StockReleased",
  "STOCK_ALERT": "StockAlert",
  "STOCK_REPLENISHED": "StockReplenished",
  "INVOICE_created": "InvoiceIssued",
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
  "GOODS_DISpatched": "GoodsDispatched",
  "GOODS_RECEIVED": "GoodsReceived",
  "TRANSFER_created": "TransferCreated",
  "DECLARATION_SUBMITTED": "DeclarationSubmitted",
  "DECLARATION_CLEARED": "DeclarationCleared",
  "VIOLATION_DETECTED": "ViolationDetected",
  "FRAUD_FLAGGED": "FraudFlagged",
  "ENTITY_BLACKLISTED": "EntityBlacklisted",
  "WARRANTY_REGISTERED": "WarrantyRegistered",
  "WARRANTY_CLAIM_opened": "WarrantyClaimOpened",
  "CUSTOMER_UPDATED": "CustomerProfileUpdated",
  "DAILY_REPORT": "DailyReportGenerated",
};

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
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "warranty-cell", undefined);
    }
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
