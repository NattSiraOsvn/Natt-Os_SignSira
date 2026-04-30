import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "../../../../core/events/event-bus";

export interface Design3dSignal {
  type: "SKU_MODEL_created" | "SKU_MODEL_UPDATED" | "PRODUCTION_SPEC_ready" | "NASI_LINKED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

const _SIGNAL_EVENT_MAP: Record<string, string> = {
  "SKU_MODEL_created": "SkuModelCreated",
  "SKU_MODEL_UPDATED": "SkuModelUpdated",
  "PRODUCTION_SPEC_ready": "ProductionSpecReady",
  "NASI_LINKED": "NaSiLinked",
};

export const Design3dSmartLinkPort = {
  emit: (signal: Design3dSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "design-3d-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "design-3d-cell", undefined);
    }
  },
  getHistory: (): TouchRecord[] => [..._touchHistory],
  notifySkuModelCreated: (skuId: string, modelPath: string): void =>
    Design3dSmartLinkPort.emit({ type: "SKU_MODEL_created", payload: { skuId, modelPath }, timestamp: Date.now() }),
  notifySkuModelUpdated: (skuId: string, version: number, changes: string[]): void =>
    Design3dSmartLinkPort.emit({ type: "SKU_MODEL_UPDATED", payload: { skuId, version, changes }, timestamp: Date.now() }),
  notifyProductionSpecReady: (skuId: string, goldWeightGram: number, diamondCount: number): void =>
    Design3dSmartLinkPort.emit({ type: "PRODUCTION_SPEC_ready", payload: { skuId, goldWeightGram, diamondCount }, timestamp: Date.now() }),
  notifyNaSiLinked: (skuId: string): void =>
    Design3dSmartLinkPort.emit({ type: "NASI_LINKED", payload: { skuId }, timestamp: Date.now() }),
};

function _routeSignal(type: Design3dSignal["type"]): string {
  const routes: Record<string, string> = {
    "SKU_MODEL_created": "production-cell",
    "SKU_MODEL_UPDATED": "audit-cell",
    "PRODUCTION_SPEC_ready": "inventory-cell",
    "NASI_LINKED": "warranty-cell",
  };
  return routes[type] ?? "audit-cell";
}
