export type FinishingStatus = "PENDING" | "IN_PROGRESS" | "QC_PASS" | "QC_FAIL" | "COMPLETED"

export interface FinishingOrder {
  orderId: string
  skuId: string
  qcPass: boolean
  qcNotes: string
  status: FinishingStatus
  productionOrderId: string
  startedAt: number
  completedAt?: number
}
