export type StoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED"
export interface StoneOrder {
  orderId: string; skuId: string
  diamondCount: number; diamondActual: number; caratWeight: number
  status: StoneStatus; productionOrderId: string
  startedAt: number; completedAt?: number
}
