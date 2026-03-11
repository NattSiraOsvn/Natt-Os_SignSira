import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";
export interface PeriodCloseSignal { type: "PERIOD_VALIDATED" | "PERIOD_CLOSED" | "PERIOD_ROLLBACK" | "GATEKEEPER_APPROVAL_REQUIRED"; payload: Record<string, unknown>; timestamp: number; }
const _touchHistory: TouchRecord[] = [];
const _SIGNAL_EVENT_MAP: Record<string, string> = { "PERIOD_VALIDATED": "PeriodValidated", "PERIOD_CLOSED": "PeriodClosed", "PERIOD_ROLLBACK": "PeriodRollback", "GATEKEEPER_APPROVAL_REQUIRED": "GatekeeperApprovalRequired" };
export const PeriodCloseSmartLinkPort = {
  emit: (signal: PeriodCloseSignal): void => { const touch: TouchRecord = { fromCellId: "period-close-cell", toCellId: _routeSignal(signal.type), timestamp: signal.timestamp, signal: signal.type, allowed: true }; _touchHistory.push(touch); const eventType = _SIGNAL_EVENT_MAP[signal.type]; if (eventType) { EventBus.publish({ type: eventType as any, payload: signal.payload }, "period-close-cell", undefined); } },
  getHistory: (): TouchRecord[] => [..._touchHistory],
  notifyPeriodValidated: (period: string, isValid: boolean, errorCount: number): void => PeriodCloseSmartLinkPort.emit({ type: "PERIOD_VALIDATED", payload: { period, isValid, errorCount }, timestamp: Date.now() }),
  notifyPeriodClosed: (period: string, journalEntriesCount: number, profitLoss: number): void => PeriodCloseSmartLinkPort.emit({ type: "PERIOD_CLOSED", payload: { period, journalEntriesCount, profitLoss }, timestamp: Date.now() }),
  notifyPeriodRollback: (period: string, reason: string, reversedEntries: number): void => PeriodCloseSmartLinkPort.emit({ type: "PERIOD_ROLLBACK", payload: { period, reason, reversedEntries }, timestamp: Date.now() }),
  notifyGatekeeperRequired: (period: string, sessionType: string): void => PeriodCloseSmartLinkPort.emit({ type: "GATEKEEPER_APPROVAL_REQUIRED", payload: { period, sessionType }, timestamp: Date.now() }),
};
function _routeSignal(type: PeriodCloseSignal["type"]): string { return { "PERIOD_VALIDATED": "audit-cell", "PERIOD_CLOSED": "finance-cell", "PERIOD_ROLLBACK": "audit-cell", "GATEKEEPER_APPROVAL_REQUIRED": "audit-cell" }[type] ?? "audit-cell"; }
