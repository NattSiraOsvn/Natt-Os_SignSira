import { CastingOrder } from "../entities"

export interface CastingCompletedEvent {
  type: "CastingCompleted"
  orderId: string
  skuId: string
  lossGram: number
  lossThresholdGram: number
  overLoss: boolean
  timestamp: number
}

export class CastingEngine {
  complete(order: CastingOrder): { order: CastingOrder; event: CastingCompletedEvent } {
    const loss = order.goldWeightInput - order.goldWeightOutput
    const updated = { ...order, lossGram: loss, status: "COMPLETED" as const, completedAt: Date.now() }
    return {
      order: updated,
      event: {
        type: "CastingCompleted",
        orderId: order.orderId,
        skuId: order.skuId,
        lossGram: loss,
        lossThresholdGram: order.lossThresholdGram,
        overLoss: loss > order.lossThresholdGram,
        timestamp: Date.now()
      }
    }
  }
}
