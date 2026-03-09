import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface FinanceSignal {
  type: "INVOICE_CREATED" | "PAYMENT_RECEIVED" | "REPORT_GENERATED" | "TAX_FILED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const FinanceSmartLinkPort = {
  emit: (signal: FinanceSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "finance-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[FINANCE SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyInvoiceCreated: (invoiceId: string, amount: number): void =>
    FinanceSmartLinkPort.emit({ type: "INVOICE_CREATED", payload: { invoiceId: invoiceId, amount: amount }, timestamp: Date.now() }),
  notifyPaymentReceived: (invoiceId: string, amount: number): void =>
    FinanceSmartLinkPort.emit({ type: "PAYMENT_RECEIVED", payload: { invoiceId: invoiceId, amount: amount }, timestamp: Date.now() }),
  notifyReportGenerated: (reportId: string, period: string): void =>
    FinanceSmartLinkPort.emit({ type: "REPORT_GENERATED", payload: { reportId: reportId, period: period }, timestamp: Date.now() }),
  notifyTaxFiled: (period: string, amount: number): void =>
    FinanceSmartLinkPort.emit({ type: "TAX_FILED", payload: { period: period, amount: amount }, timestamp: Date.now() }),
};

function _routeSignal(type: FinanceSignal["type"]): string {
  const routes: Record<string, string> = {
    "INVOICE_CREATED": "audit-cell",
    "PAYMENT_RECEIVED": "sales-cell",
    "REPORT_GENERATED": "audit-cell",
    "TAX_FILED": "audit-cell",
  };
  return routes[type] ?? "audit-cell";
}
