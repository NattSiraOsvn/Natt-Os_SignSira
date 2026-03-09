import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";

export interface WarehouseSignal {
  type: "GOODS_RECEIVED" | "GOODS_DISPATCHED" | "LOCATION_UPDATED" | "CAPACITY_ALERT";
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

export const WarehouseSmartLinkPort = {
  emit: (signal: WarehouseSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "warehouse-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[WAREHOUSE SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "warehouse-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyGoodsReceived: (shipmentId: string, items: string[]): void =>
    WarehouseSmartLinkPort.emit({ type: "GOODS_RECEIVED", payload: { shipmentId: shipmentId, items: items }, timestamp: Date.now() }),
  notifyGoodsDispatched: (shipmentId: string, orderId: string): void =>
    WarehouseSmartLinkPort.emit({ type: "GOODS_DISPATCHED", payload: { shipmentId: shipmentId, orderId: orderId }, timestamp: Date.now() }),
  notifyLocationUpdated: (itemId: string, location: string): void =>
    WarehouseSmartLinkPort.emit({ type: "LOCATION_UPDATED", payload: { itemId: itemId, location: location }, timestamp: Date.now() }),
  notifyCapacityAlert: (warehouseId: string, pct: number): void =>
    WarehouseSmartLinkPort.emit({ type: "CAPACITY_ALERT", payload: { warehouseId: warehouseId, pct: pct }, timestamp: Date.now() }),
};

function _routeSignal(type: WarehouseSignal["type"]): string {
  const routes: Record<string, string> = {
    "GOODS_RECEIVED": "inventory-cell",
    "GOODS_DISPATCHED": "order-cell",
    "LOCATION_UPDATED": "inventory-cell",
    "CAPACITY_ALERT": "production-cell",
  };
  return routes[type] ?? "audit-cell";
}
