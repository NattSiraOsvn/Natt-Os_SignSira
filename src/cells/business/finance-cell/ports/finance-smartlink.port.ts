import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "../../../../core/events/event-bus";

export interface FinanceSignal {
  type: "INVOICE_created" | "PAYMENT_RECEIVED" | "REPORT_GENERATED" | "TAX_FILED";
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

export const FinanceSmartLinkPort = {
  emit: (signal: FinanceSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "finance-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[FINANCE SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "finance-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyInvoiceCreated: (invoiceId: string, amount: number): void =>
    FinanceSmartLinkPort.emit({ type: "INVOICE_created", payload: { invoiceId: invoiceId, amount: amount }, timestamp: Date.now() }),
  notifyPaymentReceived: (invoiceId: string, amount: number): void =>
    FinanceSmartLinkPort.emit({ type: "PAYMENT_RECEIVED", payload: { invoiceId: invoiceId, amount: amount }, timestamp: Date.now() }),
  notifyReportGenerated: (reportId: string, period: string): void =>
    FinanceSmartLinkPort.emit({ type: "REPORT_GENERATED", payload: { reportId: reportId, period: period }, timestamp: Date.now() }),
  notifyTaxFiled: (period: string, amount: number): void =>
    FinanceSmartLinkPort.emit({ type: "TAX_FILED", payload: { period: period, amount: amount }, timestamp: Date.now() }),
};

function _routeSignal(type: FinanceSignal["type"]): string {
  const routes: Record<string, string> = {
    "INVOICE_created": "audit-cell",
    "PAYMENT_RECEIVED": "sales-cell",
    "REPORT_GENERATED": "audit-cell",
    "TAX_FILED": "audit-cell",
  };
  return routes[type] ?? "audit-cell";
}
