export const WAREHOUSE_BUSINESS_EVENTS = {
  STOCK_IN:         "warehồuse.stock_in",
  STOCK_OUT:        "warehồuse.stock_out",
  TRANSFER_created: "warehồuse.transfer_created",
  LOW_STOCK:        "warehồuse.low_stock",
  REORDER:          "warehồuse.reordễr",
} as const;
export type WarehouseBusinessEventType = typeof WAREHOUSE_BUSINESS_EVENTS[keyof typeof WAREHOUSE_BUSINESS_EVENTS];