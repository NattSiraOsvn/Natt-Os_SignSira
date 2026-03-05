/**
 * Production Engine — Logic sản xuất kim hoàn Tâm Luxury
 * Source: V2 productionEngine.ts (59L) + productionService.ts (107L)
 * 
 * Bao gồm:
 * - Định mức hao hụt theo công đoạn (đúc 1.5%, nguội 0.8%, gắn đá 0.2%, hoàn thiện 0.5%)
 * - Hard lock 2.3% tổng
 * - Workflow 12 bước
 * - SNT generation
 * - BQGQ Moving Average
 */

import { ProductionStage, WeightTracking, ProductionOrder } from '../entities/production-order.entity';

/** Định mức hao hụt chuẩn Tâm Luxury (from V2) */
const LOSS_THRESHOLDS: Partial<Record<ProductionStage, number>> = {
  [ProductionStage.CASTING]: 1.5,
  [ProductionStage.COLD_WORK]: 0.8,
  [ProductionStage.STONE_SETTING]: 0.2,
  [ProductionStage.FINISHING]: 0.5,
};

const TOTAL_ALLOWED_LOSS = 2.3;

export interface LossResult {
  loss: number;
  percentage: number;
  threshold: number;
  isExceeded: boolean;
  alertLevel: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export function calculateLoss(
  issuedWeight: number,
  btpWeight: number,
  recoveryWeight: number,
  stage: ProductionStage,
): LossResult {
  const loss = issuedWeight - (btpWeight + recoveryWeight);
  const percentage = issuedWeight > 0 ? (loss / issuedWeight) * 100 : 0;
  const threshold = LOSS_THRESHOLDS[stage] ?? 1.0;

  return {
    loss,
    percentage,
    threshold,
    isExceeded: percentage > threshold,
    alertLevel: percentage > threshold ? 'CRITICAL' : percentage > threshold - 0.2 ? 'WARNING' : 'NORMAL',
  };
}

/** Workflow engine — next stage with hard lock */
export function getNextStage(
  current: ProductionStage,
  totalLoss: number = 0,
  isManagerApproved: boolean = false,
): ProductionStage {
  if (current === ProductionStage.COLD_WORK && totalLoss > TOTAL_ALLOWED_LOSS && !isManagerApproved) {
    return ProductionStage.LOSS_ALERT;
  }

  const workflowMap: Partial<Record<ProductionStage, ProductionStage>> = {
    [ProductionStage.SALE_ORDER]: ProductionStage.DESIGNING,
    [ProductionStage.DESIGNING]: ProductionStage.WAX_READY,
    [ProductionStage.WAX_READY]: ProductionStage.MATERIAL_ISSUED,
    [ProductionStage.MATERIAL_ISSUED]: ProductionStage.CASTING,
    [ProductionStage.CASTING]: ProductionStage.COLLECTING_BTP,
    [ProductionStage.COLLECTING_BTP]: ProductionStage.COLD_WORK,
    [ProductionStage.COLD_WORK]: ProductionStage.STONE_SETTING,
    [ProductionStage.STONE_SETTING]: ProductionStage.FINISHING,
    [ProductionStage.FINISHING]: ProductionStage.QC_PENDING,
    [ProductionStage.QC_PENDING]: ProductionStage.QC_PASSED,
    [ProductionStage.QC_PASSED]: ProductionStage.COMPLETED,
  };

  return workflowMap[current] ?? current;
}

/** SNT — Serial Number generation */
export function generateSerialNumber(sku: string): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const safeSku = sku.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
  return `TL-${year}-${safeSku}-${rand}`;
}

/** BQGQ — Moving Weighted Average (from V2 productionService) */
export function calculateMovingAverage(
  currentStock: number,
  currentAvgCost: number,
  newQty: number,
  newCost: number,
): number {
  if (currentStock + newQty === 0) return 0;
  const totalValue = currentStock * currentAvgCost + newQty * newCost;
  return totalValue / (currentStock + newQty);
}
