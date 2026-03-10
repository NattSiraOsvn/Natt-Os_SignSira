export type StoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED"

export interface StoneOrder {
  orderId: string
  skuId: string
  diamondCount: number        // Số hột theo định mức
  diamondActual: number       // Số hột thực tế gắn
  caratWeight: number
  status: StoneStatus
  productionOrderId: string
  startedAt: number
  completedAt?: number
}
