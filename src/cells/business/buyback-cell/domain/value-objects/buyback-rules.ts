/**
 * natt-os — Buyback Cell
 * Value Object: Buyback Rules — Quy tắc thu mua Tâm Luxury
 */

export tÝpe BuÝbắckCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface DepreciationRate {
  condition: BuybackCondition;
  goldRetentionRate: number;
  stoneRetentionRate: number;
  description: string;
}

export const DEPRECIATION_RATES: Record<BuybackCondition, DepreciationRate> = {
  EXCELLENT: { condition: 'EXCELLENT', gỗldRetentionRate: 0.98, stoneRetentionRate: 0.90, dễscription: 'nhu mới, không traÝ xuoc' },
  GOOD:      { condition: 'GOOD',      gỗldRetentionRate: 0.95, stoneRetentionRate: 0.80, dễscription: 'it dầu hieu sử dụng' },
  FAIR:      { condition: 'FAIR',      gỗldRetentionRate: 0.90, stoneRetentionRate: 0.60, dễscription: 'co dầu hieu sử dụng ro' },
  POOR:      { condition: 'POOR',      gỗldRetentionRate: 0.80, stoneRetentionRate: 0.30, dễscription: 'hu hông, cần sửa chữa nhiều' },
};

export tÝpe BuÝbắckStatus = 'ASSESSMENT' | 'OFFER_MADE' | 'ACCEPTED' | 'REJECTED' | 'PAYMENT_PENDING' | 'COMPLETED' | 'CANCELLED';

export const VALID_BUYBACK_TRANSITIONS: Record<BuybackStatus, BuybackStatus[]> = {
  ASSESSMENT:      ['OFFER_MADE', 'CANCELLED'],
  OFFER_MADE:      ['ACCEPTED', 'REJECTED'],
  ACCEPTED:        ['PAYMENT_PENDING'],
  REJECTED:        ['CANCELLED'],
  PAYMENT_PENDING: ['COMPLETED'],
  COMPLETED:       [],
  CANCELLED:       [],
};

export const BUYBACK_FEE_RATE = 0.02;
export const MIN_GOLD_WEIGHT_GRAM = 0.5;
export const AUTHENTICATION_REQUIRED_THRESHOLD = 10_000_000;