import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";
export interface CastingSignal { type: "CASTING_STARTED" | "CASTING_COMPLETED" | "CASTING_LOSS_ALERT"; payload: Record<string, unknown>; timestamp: number; }
const _touchHistory: TouchRecord[] = [];
const _SIGNAL_EVENT_MAP: Record<string, string> = {"CASTING_STARTED": "CastingStarted", "CASTING_COMPLETED": "CastingCompleted", "CASTING_LOSS_ALERT": "MaterialLossReported"};
export const CastingSmartLinkPort = {
  emit: (signal: CastingSignal): void => { const touch: TouchRecord = { fromCellId: "casting-cell", toCellId: _routeSignal(signal.type), timestamp: signal.timestamp, signal: signal.type, allowed: true }; _touchHistory.push(touch); const eventType = _SIGNAL_EVENT_MAP[signal.type]; if (eventType) { EventBus.publish({ type: eventType as any, payload: signal.payload }, "casting-cell", undefined); } },
  getHistory: (): TouchRecord[] => [..._touchHistory],
  notifyCastingStarted: (orderId: string, skuId: string): void => CastingSmartLinkPort.emit({ type: "CASTING_STARTED", payload: { orderId, skuId }, timestamp: Date.now() }),
  notifyCastingCompleted: (orderId: string, skuId: string): void => CastingSmartLinkPort.emit({ type: "CASTING_COMPLETED", payload: { orderId, skuId }, timestamp: Date.now() }),
  notifyCastingLossAlert: (orderId: string, skuId: string): void => CastingSmartLinkPort.emit({ type: "CASTING_LOSS_ALERT", payload: { orderId, skuId }, timestamp: Date.now() }),
};
function _routeSignal(type: CastingSignal["type"]): string { return {"CASTING_STARTED": "production-cell", "CASTING_COMPLETED": "stone-cell", "CASTING_LOSS_ALERT": "audit-cell"}[type] ?? "production-cell"; }
