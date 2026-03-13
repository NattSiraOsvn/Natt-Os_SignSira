// @ts-nocheck
import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";

export interface ProductionSignal {
  type: "PRODUCTION_STARTED" | "PRODUCTION_COMPLETED" | "MATERIAL_REQUESTED" | "QUALITY_FAILED";
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

export const ProductionSmartLinkPort = {
  emit: (signal: ProductionSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "production-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[PRODUCTION SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "production-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyProductionStarted: (jobId: string, items: string[]): void =>
    ProductionSmartLinkPort.emit({ type: "PRODUCTION_STARTED", payload: { jobId: jobId, items: items }, timestamp: Date.now() }),
  notifyProductionCompleted: (jobId: string, qty: number): void =>
    ProductionSmartLinkPort.emit({ type: "PRODUCTION_COMPLETED", payload: { jobId: jobId, qty: qty }, timestamp: Date.now() }),
  notifyMaterialRequested: (materialId: string, qty: number): void =>
    ProductionSmartLinkPort.emit({ type: "MATERIAL_REQUESTED", payload: { materialId: materialId, qty: qty }, timestamp: Date.now() }),
  notifyQualityFailed: (jobId: string, reason: string): void =>
    ProductionSmartLinkPort.emit({ type: "QUALITY_FAILED", payload: { jobId: jobId, reason: reason }, timestamp: Date.now() }),
};

function _routeSignal(type: ProductionSignal["type"]): string {
  const routes: Record<string, string> = {
    "PRODUCTION_STARTED": "inventory-cell",
    "PRODUCTION_COMPLETED": "warehouse-cell",
    "MATERIAL_REQUESTED": "inventory-cell",
    "QUALITY_FAILED": "compliance-cell",
  };
  return routes[type] ?? "audit-cell";
}
