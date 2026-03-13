// @ts-nocheck
import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";

export interface ShowroomSignal {
  type: "PRODUCT_VIEWED" | "ITEM_RESERVED" | "APPOINTMENT_BOOKED" | "DEMO_COMPLETED";
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

export const ShowroomSmartLinkPort = {
  emit: (signal: ShowroomSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "showroom-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[SHOWROOM SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "showroom-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyProductViewed: (productId: string, customerId: string): void =>
    ShowroomSmartLinkPort.emit({ type: "PRODUCT_VIEWED", payload: { productId: productId, customerId: customerId }, timestamp: Date.now() }),
  notifyItemReserved: (productId: string, customerId: string): void =>
    ShowroomSmartLinkPort.emit({ type: "ITEM_RESERVED", payload: { productId: productId, customerId: customerId }, timestamp: Date.now() }),
  notifyAppointmentBooked: (customerId: string, date: string): void =>
    ShowroomSmartLinkPort.emit({ type: "APPOINTMENT_BOOKED", payload: { customerId: customerId, date: date }, timestamp: Date.now() }),
  notifyDemoCompleted: (customerId: string, productId: string): void =>
    ShowroomSmartLinkPort.emit({ type: "DEMO_COMPLETED", payload: { customerId: customerId, productId: productId }, timestamp: Date.now() }),
};

function _routeSignal(type: ShowroomSignal["type"]): string {
  const routes: Record<string, string> = {
    "PRODUCT_VIEWED": "analytics-cell",
    "ITEM_RESERVED": "inventory-cell",
    "APPOINTMENT_BOOKED": "customer-cell",
    "DEMO_COMPLETED": "sales-cell",
  };
  return routes[type] ?? "audit-cell";
}
