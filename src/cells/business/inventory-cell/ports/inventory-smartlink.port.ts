import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";

export interface InventorySignal {
  type: "STOCK_RESERVED" | "STOCK_UPDATED" | "LOW_STOCK_ALERT" | "STOCK_RECONCILED";
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

export const InventorySmartLinkPort = {
  emit: (signal: InventorySignal): void => {
    const touch: TouchRecord = {
      fromCellId: "inventory-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[INVENTORY SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "inventory-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyStockReserved: (itemId: string, qty: number): void =>
    InventorySmartLinkPort.emit({ type: "STOCK_RESERVED", payload: { itemId: itemId, qty: qty }, timestamp: Date.now() }),
  notifyStockUpdated: (itemId: string, delta: number): void =>
    InventorySmartLinkPort.emit({ type: "STOCK_UPDATED", payload: { itemId: itemId, delta: delta }, timestamp: Date.now() }),
  notifyLowStock: (itemId: string, currentQty: number): void =>
    InventorySmartLinkPort.emit({ type: "LOW_STOCK_ALERT", payload: { itemId: itemId, currentQty: currentQty }, timestamp: Date.now() }),
  notifyReconciled: (itemId: string): void =>
    InventorySmartLinkPort.emit({ type: "STOCK_RECONCILED", payload: { itemId: itemId }, timestamp: Date.now() }),
};

function _routeSignal(type: InventorySignal["type"]): string {
  const routes: Record<string, string> = {
    "STOCK_RESERVED": "sales-cell",
    "STOCK_UPDATED": "warehouse-cell",
    "LOW_STOCK_ALERT": "production-cell",
    "STOCK_RECONCILED": "audit-cell",
  };
  return routes[type] ?? "audit-cell";
}
