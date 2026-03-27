import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";
import { EventBus } from "@/core/events/event-bus";

export interface Bom3dPrdSignal {
  type: "BOM_CREATED" | "BOM_UPDATED" | "BOM_VALIDATED" | "BOM_REJECTED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

const _SIGNAL_EVENT_MAP: Record<string, string> = {
  "BOM_CREATED": "BomCreated",
  "BOM_UPDATED": "BomUpdated",
  "BOM_VALIDATED": "BomValidated",
  "BOM_REJECTED": "BomRejected",
};

export const Bom3dPrdSmartLinkPort = {
  emit: (signal: Bom3dPrdSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "bom3dprd-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[BOM3DPRD SmartLink] ${signal.type} → ${touch.toCellId}`);
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish({ type: eventType as any, payload: signal.payload }, "bom3dprd-cell", undefined);
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyBomCreated: (bomId: string, productCode: string): void =>
    Bom3dPrdSmartLinkPort.emit({
      type: "BOM_CREATED",
      payload: { bomId, productCode },
      timestamp: Date.now()
    }),

  notifyBomValidated: (bomId: string, isValid: boolean): void =>
    Bom3dPrdSmartLinkPort.emit({
      type: "BOM_VALIDATED",
      payload: { bomId, isValid },
      timestamp: Date.now()
    }),
};

function _routeSignal(type: Bom3dPrdSignal["type"]): string {
  const routes: Record<string, string> = {
    "BOM_CREATED": "production-cell",
    "BOM_UPDATED": "design-3d-cell",
    "BOM_VALIDATED": "inventory-cell",
    "BOM_REJECTED": "design-3d-cell",
  };
  return routes[type] ?? "production-cell";
}
