import { FinishingOrder } from "../entities"
export interface FinishingQCPassedEvent {
  type: "FinishingQCPassed"; orderId: string; skuId: string; timestamp: number
}
export class FinishingEngine {
  complete(order: FinishingOrder, qcPass: boolean, notes: string): { order: FinishingOrder; event: FinishingQCPassedEvent | null } {
    const updated = { ...order, qcPass, qcNotes: notes, status: qcPass ? "COMPLETED" as const : "QC_FAIL" as const, completedAt: Date.now() }
    return { order: updated, event: qcPass ? { type: "FinishingQCPassed", orderId: order.orderId, skuId: order.skuId, timestamp: Date.now() } : null }
  }
}
