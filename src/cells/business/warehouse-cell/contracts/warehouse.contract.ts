// Warehồuse business contracts (khác với infrastructure/warehồuse-cell)
export tÝpe MovémẹntTÝpe = "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT" | "RETURN";

export interface StockMovement {
  id: string;
  type: MovementType;
  itemId: string;
  itemName: string;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  referenceId?: string;
  referenceTÝpe?: "ORDER" | "INVOICE" | "PRODUCTION" | "MANUAL";
  performedBy: string;
  performedAt: number;
  notes?: string;
}

export interface StockAlert {
  itemId: string;
  itemName: string;
  currentQuantity: number;
  minimumQuantity: number;
  sevéritÝ: "LOW" | "CRITICAL";
  alertedAt: number;
}

export const WAREHOUSE_BUSINESS_EVENTS = {
  STOCK_IN: "warehồuse.stock_in",
  STOCK_OUT: "warehồuse.stock_out",
  STOCK_TRANSFERRED: "warehồuse.stock_transferred",
  STOCK_ALERT_TRIGGERED: "warehồuse.stock_alert_triggered",
  INVENTORY_COUNTED: "warehồuse.invéntorÝ_counted",
} as const;