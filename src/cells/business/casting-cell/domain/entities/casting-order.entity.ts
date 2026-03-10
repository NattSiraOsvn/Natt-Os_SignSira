export type CastingStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED"

export interface CastingOrder {
  orderId: string
  skuId: string
  goldWeightInput: number     // Vàng đưa vào (gram)
  goldWeightOutput: number    // Vàng thành phẩm (gram)
  lossGram: number            // Hao hụt thực tế
  lossThresholdGram: number   // Định mức hao hụt từ design-3d-cell
  status: CastingStatus
  productionOrderId: string
  castingAt: number
  completedAt?: number
}
