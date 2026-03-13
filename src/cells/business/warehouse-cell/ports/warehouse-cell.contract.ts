// @ts-nocheck
export const WAREHOUSE_BUSINESS_EVENTS = {
  STOCK_IN:         "warehouse.stock_in",
  STOCK_OUT:        "warehouse.stock_out",
  TRANSFER_CREATED: "warehouse.transfer_created",
  LOW_STOCK:        "warehouse.low_stock",
  REORDER:          "warehouse.reorder",
} as const;
export type WarehouseBusinessEventType = typeof WAREHOUSE_BUSINESS_EVENTS[keyof typeof WAREHOUSE_BUSINESS_EVENTS];
