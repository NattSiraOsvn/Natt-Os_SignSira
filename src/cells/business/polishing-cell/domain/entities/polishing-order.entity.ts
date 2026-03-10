export type PolishingStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "READY_FOR_INVENTORY"
export interface PolishingOrder {
  orderId: string; skuId: string
  status: PolishingStatus; productionOrderId: string
  readyForInventory: boolean
  startedAt: number; completedAt?: number
}
