import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";
export interface TaxSignal { type: "CIT_CALCULATED" | "VAT_SUBMITTED" | "BCTC_GENERATED" | "TAX_ANOMALY"; payload: Record<string, unknown>; timestamp: number; }
const _touchHistory: TouchRecord[] = [];
const _SIGNAL_EVENT_MAP: Record<string, string> = { "CIT_CALCULATED": "TaxDeclarationSubmitted", "VAT_SUBMITTED": "TaxDeclarationSubmitted", "BCTC_GENERATED": "PeriodClosed", "TAX_ANOMALY": "ViolationDetected" };
export const TaxSmartLinkPort = {
  emit: (signal: TaxSignal): void => { const touch: TouchRecord = { fromCellId: "tax-cell", toCellId: _routeSignal(signal.type), timestamp: signal.timestamp, signal: signal.type, allowed: true }; _touchHistory.push(touch); const eventType = _SIGNAL_EVENT_MAP[signal.type]; if (eventType) { EventBus.publish({ type: eventType as any, payload: signal.payload }, "tax-cell", undefined); } },
  getHistory: (): TouchRecord[] => [..._touchHistory],
  notifyCitCalculated: (period: string, taxableIncome: number, taxAmount: number): void => TaxSmartLinkPort.emit({ type: "CIT_CALCULATED", payload: { period, taxableIncome, taxAmount, rate: 0.20 }, timestamp: Date.now() }),
  notifyVatSubmitted: (period: string, outputVat: number, inputVat: number): void => TaxSmartLinkPort.emit({ type: "VAT_SUBMITTED", payload: { period, outputVat, inputVat, netVat: outputVat - inputVat }, timestamp: Date.now() }),
  notifyBctcGenerated: (period: string, reports: string[]): void => TaxSmartLinkPort.emit({ type: "BCTC_GENERATED", payload: { period, reports }, timestamp: Date.now() }),
  notifyTaxAnomaly: (period: string, anomaly: string): void => TaxSmartLinkPort.emit({ type: "TAX_ANOMALY", payload: { period, anomaly }, timestamp: Date.now() }),
};
function _routeSignal(type: TaxSignal["type"]): string { return { "CIT_CALCULATED": "finance-cell", "VAT_SUBMITTED": "customs-cell", "BCTC_GENERATED": "audit-cell", "TAX_ANOMALY": "compliance-cell" }[type] ?? "audit-cell"; }
