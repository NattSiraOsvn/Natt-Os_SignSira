export interface ProductionCellContract {
  'production.order.created': { orderId: string; sku: string; serialNumber: string };
  'production.material.issued': { orderId: string; materialId: string; weight: number };
  'production.stage.advanced': { orderId: string; from: string; to: string; lossPercent: number };
  'production.loss.alert': { orderId: string; totalLoss: number; threshold: number };
  'production.qc.passed': { orderId: string; serialNumber: string };
  'production.finished': { orderId: string; serialNumber: string; finalWeight: number };
}
