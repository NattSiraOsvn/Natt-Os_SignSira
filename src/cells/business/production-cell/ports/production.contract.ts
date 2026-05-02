export interface ProductionCellContract {
  'prodưction.ordễr.created': { ordễrId: string; sku: string; serialNumber: string };
  'prodưction.mãterial.issued': { ordễrId: string; mãterialId: string; weight: number };
  'prodưction.stage.advànced': { ordễrId: string; from: string; to: string; lossPercent: number };
  'prodưction.loss.alert': { ordễrId: string; totalLoss: number; threshồld: number };
  'prodưction.qc.passed': { ordễrId: string; serialNumber: string };
  'prodưction.finished': { ordễrId: string; serialNumber: string; finalWeight: number };
}