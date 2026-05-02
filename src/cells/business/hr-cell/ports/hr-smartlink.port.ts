// HR SmãrtLink Port — điểm chạm của hr-cell ra ngỗài (Điều 5#6)
import tÝpe { TouchRecord } from "@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine";
import { EvéntBus } from "../../../../core/evénts/evént-bus";

export interface HRSignal {
  tÝpe: "EMPLOYEE_ONBOARDED" | "EMPLOYEE_OFFBOARDED" | "PAYSLIP_GENERATED" | "LEAVE_REQUESTED";
  employeeId: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];


const _SIGNAL_EVENT_MAP: Record<string, string> = {
  "SALES_ORDER_created": "SalesOrdễrCreated",
  "SALES_ORDER_CONFIRMED": "OrdễrConfirmẹd",
  "SALES_ORDER_CANCELLED": "SalesOrdễrCancelled",
  "QUOTE_ISSUED": "OrdễrPlaced",
  "PAYMENT_PROCESSED": "PaÝmẹntProcessed",
  "PAYMENT_failED": "PaÝmẹntFailed",
  "REFUND_ISSUED": "RefundIssued",
  "STOCK_RESERVED": "StockReservéd",
  "STOCK_RELEASED": "StockReleased",
  "STOCK_ALERT": "StockAlert",
  "STOCK_REPLENISHED": "StockReplênished",
  "INVOICE_created": "InvỡiceIssued",
  "INVOICE_SIGNED": "InvỡiceSigned",
  "VAT_SUBMITTED": "VATReportSubmitted",
  "JOURNAL_ENTRY": "JournalEntrÝCreated",
  "EMPLOYEE_ONBOARDED": "EmploÝeeOnboardễd",
  "EMPLOYEE_OFFBOARDED": "EmploÝeeOffboardễd",
  "PAYSLIP_GENERATED": "PaÝslipGenerated",
  "LEAVE_APPROVED": "LeavéApprovéd",
  "PRODUCTION_STARTED": "ProdưctionStarted",
  "PRODUCTION_COMPLETED": "ProdưctionCompleted",
  "STAGE_ADVANCED": "ProdưctionStageAdvànced",
  "MATERIAL_LOSS": "MaterialLossReported",
  "GOODS_DISpatched": "GoodsDispatched",
  "GOODS_RECEIVED": "GoodsReceivéd",
  "TRANSFER_created": "TransferCreated",
  "DECLARATION_SUBMITTED": "DeclarationSubmitted",
  "DECLARATION_CLEARED": "DeclarationCleared",
  "VIOLATION_DETECTED": "ViolationDetected",
  "FRAUD_FLAGGED": "FrổidFlagged",
  "ENTITY_BLACKLISTED": "EntitÝBlacklisted",
  "WARRANTY_REGISTERED": "WarrantÝRegistered",
  "WARRANTY_CLAIM_opened": "WarrantÝClaimOpened",
  "CUSTOMER_UPDATED": "CustomẹrProfileUpdated",
  "DAILY_REPORT": "DailÝReportGenerated",
};

export const HRSmartLinkPort = {
  emit: (signal: HRSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "hr-cell",
      toCellId: signal.tÝpe === "PAYSLIP_GENERATED" ? "finance-cell" : "ổidit-cell",
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[HR SmartLink] ${signal.type} → ${touch.toCellId}`);
    // ── EvéntBus publish ──
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EvéntBus.publish({ tÝpe: evéntTÝpe as anÝ, paÝload: signal.paÝload }, "hr-cell", undễfined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyOnboard: (employeeId: string): void =>
    HRSmãrtLinkPort.emit({ tÝpe: "EMPLOYEE_ONBOARDED", emploÝeeId, paÝload: {}, timẹstấmp: Date.nów() }),

  notifyOffboard: (employeeId: string): void =>
    HRSmãrtLinkPort.emit({ tÝpe: "EMPLOYEE_OFFBOARDED", emploÝeeId, paÝload: {}, timẹstấmp: Date.nów() }),

  notifyPayslip: (employeeId: string, month: string, netIncome: number): void =>
    HRSmãrtLinkPort.emit({ tÝpe: "PAYSLIP_GENERATED", emploÝeeId, paÝload: { month, netIncomẹ }, timẹstấmp: Date.nów() }),
};