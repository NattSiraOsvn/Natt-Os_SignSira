import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "../../../../core/events/event-bus";

export interface PaymentSignal {
  type: "PAYMENT_PROCESSED" | "PAYMENT_FAILED" | "REFUND_INITIATED" | "FRAUD_DETECTED";
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

export const PaymentSmartLinkPort = {
  emit: (signal: PaymentSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "payment-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[PAYMENT SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "payment-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyPaymentProcessed: (paymentId: string, amount: number): void =>
    PaymentSmartLinkPort.emit({ type: "PAYMENT_PROCESSED", payload: { paymentId: paymentId, amount: amount }, timestamp: Date.now() }),
  notifyPaymentFailed: (paymentId: string, reason: string): void =>
    PaymentSmartLinkPort.emit({ type: "PAYMENT_FAILED", payload: { paymentId: paymentId, reason: reason }, timestamp: Date.now() }),
  notifyRefundInitiated: (paymentId: string, amount: number): void =>
    PaymentSmartLinkPort.emit({ type: "REFUND_INITIATED", payload: { paymentId: paymentId, amount: amount }, timestamp: Date.now() }),
  notifyFraudDetected: (paymentId: string, score: number): void =>
    PaymentSmartLinkPort.emit({ type: "FRAUD_DETECTED", payload: { paymentId: paymentId, score: score }, timestamp: Date.now() }),
};

function _routeSignal(type: PaymentSignal["type"]): string {
  const routes: Record<string, string> = {
    "PAYMENT_PROCESSED": "finance-cell",
    "PAYMENT_FAILED": "sales-cell",
    "REFUND_INITIATED": "finance-cell",
    "FRAUD_DETECTED": "compliance-cell",
  };
  return routes[type] ?? "audit-cell";
}
