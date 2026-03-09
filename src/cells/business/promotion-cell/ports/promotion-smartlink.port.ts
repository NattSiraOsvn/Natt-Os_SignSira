import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";

export interface PromotionSignal {
  type: "PROMO_ACTIVATED" | "PROMO_EXPIRED" | "VOUCHER_REDEEMED" | "CAMPAIGN_LAUNCHED";
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

export const PromotionSmartLinkPort = {
  emit: (signal: PromotionSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "promotion-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[PROMOTION SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "promotion-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyPromoActivated: (promoId: string, discount: number): void =>
    PromotionSmartLinkPort.emit({ type: "PROMO_ACTIVATED", payload: { promoId: promoId, discount: discount }, timestamp: Date.now() }),
  notifyPromoExpired: (promoId: string): void =>
    PromotionSmartLinkPort.emit({ type: "PROMO_EXPIRED", payload: { promoId: promoId }, timestamp: Date.now() }),
  notifyVoucherRedeemed: (voucherId: string, amount: number): void =>
    PromotionSmartLinkPort.emit({ type: "VOUCHER_REDEEMED", payload: { voucherId: voucherId, amount: amount }, timestamp: Date.now() }),
  notifyCampaignLaunched: (campaignId: string): void =>
    PromotionSmartLinkPort.emit({ type: "CAMPAIGN_LAUNCHED", payload: { campaignId: campaignId }, timestamp: Date.now() }),
};

function _routeSignal(type: PromotionSignal["type"]): string {
  const routes: Record<string, string> = {
    "PROMO_ACTIVATED": "sales-cell",
    "PROMO_EXPIRED": "analytics-cell",
    "VOUCHER_REDEEMED": "finance-cell",
    "CAMPAIGN_LAUNCHED": "customer-cell",
  };
  return routes[type] ?? "audit-cell";
}
