import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";
export interface FinishingSignal { type: "FINISHING_STARTED" | "FINISHING_QC_PASSED" | "FINISHING_QC_FAILED"; payload: Record<string, unknown>; timestamp: number; }
const _touchHistory: TouchRecord[] = [];
const _SIGNAL_EVENT_MAP: Record<string, string> = {"FINISHING_STARTED": "ProductionStageAdvanced", "FINISHING_QC_PASSED": "FinishingQCPassed", "FINISHING_QC_FAILED": "ViolationDetected"};
export const FinishingSmartLinkPort = {
  emit: (signal: FinishingSignal): void => { const touch: TouchRecord = { fromCellId: "finishing-cell", toCellId: _routeSignal(signal.type), timestamp: signal.timestamp, signal: signal.type, allowed: true }; _touchHistory.push(touch); const eventType = _SIGNAL_EVENT_MAP[signal.type]; if (eventType) { EventBus.publish({ type: eventType as any, payload: signal.payload }, "finishing-cell", undefined); } },
  getHistory: (): TouchRecord[] => [..._touchHistory],
  notifyFinishingStarted: (orderId: string, skuId: string): void => FinishingSmartLinkPort.emit({ type: "FINISHING_STARTED", payload: { orderId, skuId }, timestamp: Date.now() }),
  notifyFinishingQcPassed: (orderId: string, skuId: string): void => FinishingSmartLinkPort.emit({ type: "FINISHING_QC_PASSED", payload: { orderId, skuId }, timestamp: Date.now() }),
  notifyFinishingQcFailed: (orderId: string, skuId: string): void => FinishingSmartLinkPort.emit({ type: "FINISHING_QC_FAILED", payload: { orderId, skuId }, timestamp: Date.now() }),
};
function _routeSignal(type: FinishingSignal["type"]): string { return {"FINISHING_STARTED": "production-cell", "FINISHING_QC_PASSED": "polishing-cell", "FINISHING_QC_FAILED": "casting-cell"}[type] ?? "production-cell"; }
