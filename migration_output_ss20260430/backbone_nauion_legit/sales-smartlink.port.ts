import type { TouchRecord } from "@/cells/infrastructure/SmartLink-cell/domain/services/SmartLink.engine";
import { EventBus } from "../../../../core/events/event-bus";

export interface SalesSignal {
  type: "SALES_ORDER_created" | "SALES_ORDER_CONFIRMED" | "SALES_ORDER_CANCELLED" | "QUOTE_ISSUED";
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
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "sales-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyOrderCreated: (orderId: string, amount: number): void =>
    SalesSmartLinkPort.emit({ type: "SALES_ORDER_created", payload: { orderId: orderId, amount: amount }, timestamp: Date.now() }),
  notifyOrderConfirmed: (orderId: string): void =>
    SalesSmartLinkPort.emit({ type: "SALES_ORDER_CONFIRMED", payload: { orderId: orderId }, timestamp: Date.now() }),
  notifyOrderCancelled: (orderId: string, reason: string): void =>
    SalesSmartLinkPort.emit({ type: "SALES_ORDER_CANCELLED", payload: { orderId: orderId, reason: reason }, timestamp: Date.now() }),
  notifyQuoteIssued: (quoteId: string, customerId: string): void =>
    SalesSmartLinkPort.emit({ type: "QUOTE_ISSUED", payload: { quoteId: quoteId, customerId: customerId }, timestamp: Date.now() }),
};

function _routeSignal(type: SalesSignal["type"]): string {
  const routes: Record<string, string> = {
    "SALES_ORDER_created": "payment-cell",
    "SALES_ORDER_CONFIRMED": "inventory-cell",
    "SALES_ORDER_CANCELLED": "finance-cell",
    "QUOTE_ISSUED": "customer-cell",
  };
  return routes[type] ?? "audit-cell";
}
