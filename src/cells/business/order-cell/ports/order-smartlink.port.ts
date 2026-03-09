import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";

export interface OrderSignal {
  type: "ORDER_PLACED" | "ORDER_FULFILLED" | "ORDER_RETURNED" | "ORDER_DISPUTED";
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

export const OrderSmartLinkPort = {
  emit: (signal: OrderSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "order-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[ORDER SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "order-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyOrderPlaced: (orderId: string, items: string[]): void =>
    OrderSmartLinkPort.emit({ type: "ORDER_PLACED", payload: { orderId: orderId, items: items }, timestamp: Date.now() }),
  notifyOrderFulfilled: (orderId: string): void =>
    OrderSmartLinkPort.emit({ type: "ORDER_FULFILLED", payload: { orderId: orderId }, timestamp: Date.now() }),
  notifyOrderReturned: (orderId: string, reason: string): void =>
    OrderSmartLinkPort.emit({ type: "ORDER_RETURNED", payload: { orderId: orderId, reason: reason }, timestamp: Date.now() }),
  notifyOrderDisputed: (orderId: string, disputeId: string): void =>
    OrderSmartLinkPort.emit({ type: "ORDER_DISPUTED", payload: { orderId: orderId, disputeId: disputeId }, timestamp: Date.now() }),
};

function _routeSignal(type: OrderSignal["type"]): string {
  const routes: Record<string, string> = {
    "ORDER_PLACED": "inventory-cell",
    "ORDER_FULFILLED": "sales-cell",
    "ORDER_RETURNED": "warehouse-cell",
    "ORDER_DISPUTED": "compliance-cell",
  };
  return routes[type] ?? "audit-cell";
}
