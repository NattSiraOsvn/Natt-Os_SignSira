export type CastingStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED"
export interface CastingOrder {
  orderId: string
  skuId: string
  goldWeightInput: number
  goldWeightOutput: number
  lossGram: number
  lossThresholdGram: number
  status: CastingStatus
  productionOrderId: string
  castingAt: number
  completedAt?: number
}
