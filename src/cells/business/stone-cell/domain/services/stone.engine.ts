import { StoneOrder } from "../entities"
export interface StoneSettingCompletedEvent {
  type: "StoneSettingCompleted"
  orderId: string; skuId: string; diamondCount: number; timestamp: number
}
export class StoneEngine {
  complete(order: StoneOrder): { order: StoneOrder; event: StoneSettingCompletedEvent } {
    const updated = { ...order, status: "COMPLETED" as const, completedAt: Date.now() }
    return { order: updated, event: { type: "StoneSettingCompleted", orderId: order.orderId, skuId: order.skuId, diamondCount: order.diamondActual, timestamp: Date.now() } }
  }
}
