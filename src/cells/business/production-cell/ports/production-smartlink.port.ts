import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface ProductionSignal {
  type: "PRODUCTION_STARTED" | "PRODUCTION_COMPLETED" | "MATERIAL_REQUESTED" | "QUALITY_FAILED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const ProductionSmartLinkPort = {
  emit: (signal: ProductionSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "production-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[PRODUCTION SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyProductionStarted: (jobId: string, items: string[]): void =>
    ProductionSmartLinkPort.emit({ type: "PRODUCTION_STARTED", payload: { jobId: jobId, items: items }, timestamp: Date.now() }),
  notifyProductionCompleted: (jobId: string, qty: number): void =>
    ProductionSmartLinkPort.emit({ type: "PRODUCTION_COMPLETED", payload: { jobId: jobId, qty: qty }, timestamp: Date.now() }),
  notifyMaterialRequested: (materialId: string, qty: number): void =>
    ProductionSmartLinkPort.emit({ type: "MATERIAL_REQUESTED", payload: { materialId: materialId, qty: qty }, timestamp: Date.now() }),
  notifyQualityFailed: (jobId: string, reason: string): void =>
    ProductionSmartLinkPort.emit({ type: "QUALITY_FAILED", payload: { jobId: jobId, reason: reason }, timestamp: Date.now() }),
};

function _routeSignal(type: ProductionSignal["type"]): string {
  const routes: Record<string, string> = {
    "PRODUCTION_STARTED": "inventory-cell",
    "PRODUCTION_COMPLETED": "warehouse-cell",
    "MATERIAL_REQUESTED": "inventory-cell",
    "QUALITY_FAILED": "compliance-cell",
  };
  return routes[type] ?? "audit-cell";
}
