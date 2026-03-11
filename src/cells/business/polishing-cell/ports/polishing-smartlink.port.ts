import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";
export interface PolishingSignal { type: "POLISHING_STARTED" | "POLISHING_COMPLETED" | "PRODUCT_READY_FOR_INVENTORY"; payload: Record<string, unknown>; timestamp: number; }
const _touchHistory: TouchRecord[] = [];
const _SIGNAL_EVENT_MAP: Record<string, string> = {"POLISHING_STARTED": "ProductionStageAdvanced", "POLISHING_COMPLETED": "ProductionCompleted", "PRODUCT_READY_FOR_INVENTORY": "ProductReadyForInventory"};
export const PolishingSmartLinkPort = {
  emit: (signal: PolishingSignal): void => { const touch: TouchRecord = { fromCellId: "polishing-cell", toCellId: _routeSignal(signal.type), timestamp: signal.timestamp, signal: signal.type, allowed: true }; _touchHistory.push(touch); const eventType = _SIGNAL_EVENT_MAP[signal.type]; if (eventType) { EventBus.publish({ type: eventType as any, payload: signal.payload }, "polishing-cell", undefined); } },
  getHistory: (): TouchRecord[] => [..._touchHistory],
  notifyPolishingStarted: (orderId: string, skuId: string): void => PolishingSmartLinkPort.emit({ type: "POLISHING_STARTED", payload: { orderId, skuId }, timestamp: Date.now() }),
  notifyPolishingCompleted: (orderId: string, skuId: string): void => PolishingSmartLinkPort.emit({ type: "POLISHING_COMPLETED", payload: { orderId, skuId }, timestamp: Date.now() }),
  notifyProductReadyForInventory: (orderId: string, skuId: string): void => PolishingSmartLinkPort.emit({ type: "PRODUCT_READY_FOR_INVENTORY", payload: { orderId, skuId }, timestamp: Date.now() }),
};
function _routeSignal(type: PolishingSignal["type"]): string { return {"POLISHING_STARTED": "production-cell", "POLISHING_COMPLETED": "production-cell", "PRODUCT_READY_FOR_INVENTORY": "inventory-cell"}[type] ?? "production-cell"; }
