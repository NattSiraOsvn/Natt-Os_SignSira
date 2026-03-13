// @ts-nocheck
/**
 * Production Order Entity — Lệnh sản xuất
 * Source: V2 types.ts ProductionOrder + OrderStatus
 */

export enum ProductionStage {
  SALE_ORDER = 'SALE_ORDER',
  DESIGNING = 'DESIGNING',
  WAX_READY = 'WAX_READY',
  MATERIAL_ISSUED = 'MATERIAL_ISSUED',
  CASTING = 'CASTING',
  COLLECTING_BTP = 'COLLECTING_BTP',
  COLD_WORK = 'COLD_WORK',
  STONE_SETTING = 'STONE_SETTING',
  FINISHING = 'FINISHING',
  QC_PENDING = 'QC_PENDING',
  QC_PASSED = 'QC_PASSED',
  COMPLETED = 'COMPLETED',
  LOSS_ALERT = 'LOSS_ALERT',
}

export interface WeightTracking {
  stage: ProductionStage;
  weight_before: number;
  weight_after: number;
  recovery_gold: number;
  timestamp: string;
  operator_id: string;
}

export interface ProductionOrder {
  id: string;
  serial_number: string;       // SNT — generated
  sku: string;
  customer_order_ref?: string;
  stage: ProductionStage;
  weight_trackings: WeightTracking[];
  total_loss_percent: number;
  bom_ref?: string;            // Bill of Materials reference
  created_at: string;
  updated_at: string;
}
