import type { TouchRecord } from "@/cells/infrastructure/SmartLink-cell/domain/services/SmartLink.engine";
import { EventBus } from "../../../../core/events/event-bus";

export interface CustomerSignal {
  type: "CUSTOMER_REGISTERED" | "CUSTOMER_VERIFIED" | "LOYALTY_UPDATED" | "CUSTOMER_CHURNED";
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

export const CustomerSmartLinkPort = {
  emit: (signal: CustomerSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "customer-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[CUSTOMER SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "customer-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyCustomerRegistered: (customerId: string): void =>
    CustomerSmartLinkPort.emit({ type: "CUSTOMER_REGISTERED", payload: { customerId: customerId }, timestamp: Date.now() }),
  notifyCustomerVerified: (customerId: string, tier: string): void =>
    CustomerSmartLinkPort.emit({ type: "CUSTOMER_VERIFIED", payload: { customerId: customerId, tier: tier }, timestamp: Date.now() }),
  notifyLoyaltyUpdated: (customerId: string, points: number): void =>
    CustomerSmartLinkPort.emit({ type: "LOYALTY_UPDATED", payload: { customerId: customerId, points: points }, timestamp: Date.now() }),
  notifyCustomerChurned: (customerId: string): void =>
    CustomerSmartLinkPort.emit({ type: "CUSTOMER_CHURNED", payload: { customerId: customerId }, timestamp: Date.now() }),
};

function _routeSignal(type: CustomerSignal["type"]): string {
  const routes: Record<string, string> = {
    "CUSTOMER_REGISTERED": "sales-cell",
    "CUSTOMER_VERIFIED": "sales-cell",
    "LOYALTY_UPDATED": "promotion-cell",
    "CUSTOMER_CHURNED": "analytics-cell",
  };
  return routes[type] ?? "audit-cell";
}
