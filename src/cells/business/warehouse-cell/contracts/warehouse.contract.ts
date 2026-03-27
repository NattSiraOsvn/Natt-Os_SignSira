// Warehouse business contracts (khác với infrastructure/warehouse-cell)
export type MovementType = "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT" | "RETURN";

export interface StockMovement {
  id: string;
  type: MovementType;
  itemId: string;
  itemName: string;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  referenceId?: string;
  referenceType?: "ORDER" | "INVOICE" | "PRODUCTION" | "MANUAL";
  performedBy: string;
  performedAt: number;
  notes?: string;
}

export interface StockAlert {
  itemId: string;
  itemName: string;
  currentQuantity: number;
  minimumQuantity: number;
  severity: "LOW" | "CRITICAL";
  alertedAt: number;
}

export const WAREHOUSE_BUSINESS_EVENTS = {
  STOCK_IN: "warehouse.stock_in",
  STOCK_OUT: "warehouse.stock_out",
  STOCK_TRANSFERRED: "warehouse.stock_transferred",
  STOCK_ALERT_TRIGGERED: "warehouse.stock_alert_triggered",
  INVENTORY_COUNTED: "warehouse.inventory_counted",
} as const;
