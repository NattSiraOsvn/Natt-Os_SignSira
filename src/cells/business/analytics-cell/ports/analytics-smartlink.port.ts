import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "../../../../core/events/event-bus";

export interface AnalyticsSignal {
  type: "REPORT_READY" | "ANOMALY_DETECTED" | "INSIGHT_PUBLISHED" | "FORECAST_UPDATED";
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

export const AnalyticsSmartLinkPort = {
  emit: (signal: AnalyticsSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "analytics-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[ANALYTICS SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "analytics-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyReportReady: (reportId: string, type: string): void =>
    AnalyticsSmartLinkPort.emit({ type: "REPORT_READY", payload: { reportId: reportId, type: type }, timestamp: Date.now() }),
  notifyAnomalyDetected: (entityId: string, score: number): void =>
    AnalyticsSmartLinkPort.emit({ type: "ANOMALY_DETECTED", payload: { entityId: entityId, score: score }, timestamp: Date.now() }),
  notifyInsightPublished: (insightId: string): void =>
    AnalyticsSmartLinkPort.emit({ type: "INSIGHT_PUBLISHED", payload: { insightId: insightId }, timestamp: Date.now() }),
  notifyForecastUpdated: (period: string): void =>
    AnalyticsSmartLinkPort.emit({ type: "FORECAST_UPDATED", payload: { period: period }, timestamp: Date.now() }),
};

function _routeSignal(type: AnalyticsSignal["type"]): string {
  const routes: Record<string, string> = {
    "REPORT_READY": "audit-cell",
    "ANOMALY_DETECTED": "compliance-cell",
    "INSIGHT_PUBLISHED": "sales-cell",
    "FORECAST_UPDATED": "production-cell",
  };
  return routes[type] ?? "audit-cell";
}
