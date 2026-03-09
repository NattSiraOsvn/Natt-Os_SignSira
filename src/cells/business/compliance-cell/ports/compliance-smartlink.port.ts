import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";

export interface ComplianceSignal {
  type: "VIOLATION_DETECTED" | "AUDIT_TRIGGERED" | "POLICY_BREACH" | "RISK_ESCALATED";
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

export const ComplianceSmartLinkPort = {
  emit: (signal: ComplianceSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "compliance-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[COMPLIANCE SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EventBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "compliance-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyViolationDetected: (violationId: string, severity: string): void =>
    ComplianceSmartLinkPort.emit({ type: "VIOLATION_DETECTED", payload: { violationId: violationId, severity: severity }, timestamp: Date.now() }),
  notifyAuditTriggered: (entityId: string, reason: string): void =>
    ComplianceSmartLinkPort.emit({ type: "AUDIT_TRIGGERED", payload: { entityId: entityId, reason: reason }, timestamp: Date.now() }),
  notifyPolicyBreach: (employeeId: string, policy: string): void =>
    ComplianceSmartLinkPort.emit({ type: "POLICY_BREACH", payload: { employeeId: employeeId, policy: policy }, timestamp: Date.now() }),
  notifyRiskEscalated: (riskId: string, level: string): void =>
    ComplianceSmartLinkPort.emit({ type: "RISK_ESCALATED", payload: { riskId: riskId, level: level }, timestamp: Date.now() }),
};

function _routeSignal(type: ComplianceSignal["type"]): string {
  const routes: Record<string, string> = {
    "VIOLATION_DETECTED": "audit-cell",
    "AUDIT_TRIGGERED": "audit-cell",
    "POLICY_BREACH": "hr-cell",
    "RISK_ESCALATED": "audit-cell",
  };
  return routes[type] ?? "audit-cell";
}
