// @ts-nocheck
import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";

export interface BuybackSignal {
  type: "BUYBACK_REQUESTED" | "VALUATION_COMPLETED" | "BUYBACK_APPROVED" | "BUYBACK_REJECTED";
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

export const BuybackSmartLinkPort = {
  emit: (signal: BuybackSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "buyback-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[BUYBACK SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "buyback-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyBuybackRequested: (itemId: string, customerId: string): void =>
    BuybackSmartLinkPort.emit({ type: "BUYBACK_REQUESTED", payload: { itemId: itemId, customerId: customerId }, timestamp: Date.now() }),
  notifyValuationDone: (itemId: string, price: number): void =>
    BuybackSmartLinkPort.emit({ type: "VALUATION_COMPLETED", payload: { itemId: itemId, price: price }, timestamp: Date.now() }),
  notifyBuybackApproved: (itemId: string, price: number): void =>
    BuybackSmartLinkPort.emit({ type: "BUYBACK_APPROVED", payload: { itemId: itemId, price: price }, timestamp: Date.now() }),
  notifyBuybackRejected: (itemId: string, reason: string): void =>
    BuybackSmartLinkPort.emit({ type: "BUYBACK_REJECTED", payload: { itemId: itemId, reason: reason }, timestamp: Date.now() }),
};

function _routeSignal(type: BuybackSignal["type"]): string {
  const routes: Record<string, string> = {
    "BUYBACK_REQUESTED": "customer-cell",
    "VALUATION_COMPLETED": "sales-cell",
    "BUYBACK_APPROVED": "inventory-cell",
    "BUYBACK_REJECTED": "customer-cell",
  };
  return routes[type] ?? "audit-cell";
}
