import type { TouchRecord } from "@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine";

export interface InventorySignal {
  type: "STOCK_RESERVED" | "STOCK_UPDATED" | "LOW_STOCK_ALERT" | "STOCK_RECONCILED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

export const InventorySmartLinkPort = {
  emit: (signal: InventorySignal): void => {
    const touch: TouchRecord = {
      fromCellId: "inventory-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    console.log(`[INVENTORY SmartLink] ${signal.type} → ${touch.toCellId}`);
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  notifyStockReserved: (itemId: string, qty: number): void =>
    InventorySmartLinkPort.emit({ type: "STOCK_RESERVED", payload: { itemId: itemId, qty: qty }, timestamp: Date.now() }),
  notifyStockUpdated: (itemId: string, delta: number): void =>
    InventorySmartLinkPort.emit({ type: "STOCK_UPDATED", payload: { itemId: itemId, delta: delta }, timestamp: Date.now() }),
  notifyLowStock: (itemId: string, currentQty: number): void =>
    InventorySmartLinkPort.emit({ type: "LOW_STOCK_ALERT", payload: { itemId: itemId, currentQty: currentQty }, timestamp: Date.now() }),
  notifyReconciled: (itemId: string): void =>
    InventorySmartLinkPort.emit({ type: "STOCK_RECONCILED", payload: { itemId: itemId }, timestamp: Date.now() }),
};

function _routeSignal(type: InventorySignal["type"]): string {
  const routes: Record<string, string> = {
    "STOCK_RESERVED": "sales-cell",
    "STOCK_UPDATED": "warehouse-cell",
    "LOW_STOCK_ALERT": "production-cell",
    "STOCK_RECONCILED": "audit-cell",
  };
  return routes[type] ?? "audit-cell";
}
