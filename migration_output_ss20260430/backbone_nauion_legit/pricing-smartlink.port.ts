import type { TouchRecord } from "@/cells/infrastructure/SmartLink-cell/domain/services/SmartLink.engine";
import { EventBus } from "../../../../core/events/event-bus";

export interface PricingSignal {
  type: "PRICE_UPDATED" | "DISCOUNT_APPLIED" | "PRICE_ALERT" | "MARGIN_BREACH";
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

export const PricingSmartLinkPort = {
  emit: (signal: PricingSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "pricing-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[PRICING SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "pricing-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyPriceUpdated: (itemId: string, newPrice: number): void =>
    PricingSmartLinkPort.emit({ type: "PRICE_UPDATED", payload: { itemId: itemId, newPrice: newPrice }, timestamp: Date.now() }),
  notifyDiscountApplied: (itemId: string, pct: number): void =>
    PricingSmartLinkPort.emit({ type: "DISCOUNT_APPLIED", payload: { itemId: itemId, pct: pct }, timestamp: Date.now() }),
  notifyPriceAlert: (itemId: string, delta: number): void =>
    PricingSmartLinkPort.emit({ type: "PRICE_ALERT", payload: { itemId: itemId, delta: delta }, timestamp: Date.now() }),
  notifyMarginBreach: (itemId: string, margin: number): void =>
    PricingSmartLinkPort.emit({ type: "MARGIN_BREACH", payload: { itemId: itemId, margin: margin }, timestamp: Date.now() }),
};

function _routeSignal(type: PricingSignal["type"]): string {
  const routes: Record<string, string> = {
    "PRICE_UPDATED": "sales-cell",
    "DISCOUNT_APPLIED": "promotion-cell",
    "PRICE_ALERT": "analytics-cell",
    "MARGIN_BREACH": "finance-cell",
  };
  return routes[type] ?? "audit-cell";
}
