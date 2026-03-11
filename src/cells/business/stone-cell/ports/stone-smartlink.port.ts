import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";
export interface StoneSignal { type: "STONE_SETTING_STARTED" | "STONE_SETTING_COMPLETED" | "STONE_SHORTAGE"; payload: Record<string, unknown>; timestamp: number; }
const _touchHistory: TouchRecord[] = [];
const _SIGNAL_EVENT_MAP: Record<string, string> = {"STONE_SETTING_STARTED": "ProductionStageAdvanced", "STONE_SETTING_COMPLETED": "StoneSetCompleted", "STONE_SHORTAGE": "StockAlert"};
export const StoneSmartLinkPort = {
  emit: (signal: StoneSignal): void => { const touch: TouchRecord = { fromCellId: "stone-cell", toCellId: _routeSignal(signal.type), timestamp: signal.timestamp, signal: signal.type, allowed: true }; _touchHistory.push(touch); const eventType = _SIGNAL_EVENT_MAP[signal.type]; if (eventType) { EventBus.publish({ type: eventType as any, payload: signal.payload }, "stone-cell", undefined); } },
  getHistory: (): TouchRecord[] => [..._touchHistory],
  notifyStoneSettingStarted: (orderId: string, skuId: string): void => StoneSmartLinkPort.emit({ type: "STONE_SETTING_STARTED", payload: { orderId, skuId }, timestamp: Date.now() }),
  notifyStoneSettingCompleted: (orderId: string, skuId: string): void => StoneSmartLinkPort.emit({ type: "STONE_SETTING_COMPLETED", payload: { orderId, skuId }, timestamp: Date.now() }),
  notifyStoneShortage: (orderId: string, skuId: string): void => StoneSmartLinkPort.emit({ type: "STONE_SHORTAGE", payload: { orderId, skuId }, timestamp: Date.now() }),
};
function _routeSignal(type: StoneSignal["type"]): string { return {"STONE_SETTING_STARTED": "production-cell", "STONE_SETTING_COMPLETED": "finishing-cell", "STONE_SHORTAGE": "inventory-cell"}[type] ?? "production-cell"; }
