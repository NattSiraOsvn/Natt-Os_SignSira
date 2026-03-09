import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface WarehouseSignal {
  type: "GOODS_RECEIVED" | "GOODS_DISPATCHED" | "LOCATION_UPDATED" | "CAPACITY_ALERT";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const WarehouseSmartLinkPort = {
  emit: (signal: WarehouseSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "warehouse-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[WAREHOUSE SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyGoodsReceived: (shipmentId: string, items: string[]): void =>
    WarehouseSmartLinkPort.emit({ type: "GOODS_RECEIVED", payload: { shipmentId: shipmentId, items: items }, timestamp: Date.now() }),
  notifyGoodsDispatched: (shipmentId: string, orderId: string): void =>
    WarehouseSmartLinkPort.emit({ type: "GOODS_DISPATCHED", payload: { shipmentId: shipmentId, orderId: orderId }, timestamp: Date.now() }),
  notifyLocationUpdated: (itemId: string, location: string): void =>
    WarehouseSmartLinkPort.emit({ type: "LOCATION_UPDATED", payload: { itemId: itemId, location: location }, timestamp: Date.now() }),
  notifyCapacityAlert: (warehouseId: string, pct: number): void =>
    WarehouseSmartLinkPort.emit({ type: "CAPACITY_ALERT", payload: { warehouseId: warehouseId, pct: pct }, timestamp: Date.now() }),
};

function _routeSignal(type: WarehouseSignal["type"]): string {
  const routes: Record<string, string> = {
    "GOODS_RECEIVED": "inventory-cell",
    "GOODS_DISPATCHED": "order-cell",
    "LOCATION_UPDATED": "inventory-cell",
    "CAPACITY_ALERT": "production-cell",
  };
  return routes[type] ?? "audit-cell";
}
