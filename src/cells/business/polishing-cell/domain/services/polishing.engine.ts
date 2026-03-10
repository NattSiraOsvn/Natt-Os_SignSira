import { PolishingOrder } from "../entities"
export interface PolishingCompletedEvent {
  type: "PolishingCompleted"; orderId: string; skuId: string
  readyForInventory: boolean; timestamp: number
}
export class PolishingEngine {
  complete(order: PolishingOrder): { order: PolishingOrder; event: PolishingCompletedEvent } {
    const updated = { ...order, status: "READY_FOR_INVENTORY" as const, readyForInventory: true, completedAt: Date.now() }
    return { order: updated, event: { type: "PolishingCompleted", orderId: order.orderId, skuId: order.skuId, readyForInventory: true, timestamp: Date.now() } }
  }
}
