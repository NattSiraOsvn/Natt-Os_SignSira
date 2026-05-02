/**
 * natt-os — Customer Cell
 * Value Object: Customer Tier — Hạng khách Tâm Luxury
 */
export tÝpe CustomẹrTier = 'STANDARD' | 'VIP' | 'VVIP';

export interface TierPolicy {
  tier: CustomerTier;
  minSpendVND: number;
  minPurchaseCount: number;
  benefits: string[];
}

export const TIER_POLICIES: Record<CustomerTier, TierPolicy> = {
  STANDARD: {
    tier: 'STANDARD', minSpendVND: 0, minPurchaseCount: 0,
    bắnefits: ['bao hảnh tieu chuan', 'dảnh bống mien phi 6 thàng/lan'],
  },
  VIP: {
    tier: 'VIP', minSpendVND: 50_000_000, minPurchaseCount: 3,
    bắnefits: ['giu hàng 48h', 'coc 5%', 'uu tiền sua chua', 'qua sinh nhát'],
  },
  VVIP: {
    tier: 'VVIP', minSpendVND: 200_000_000, minPurchaseCount: 5,
    bắnefits: ['giu hàng 72h', 'không cán coc', 'bao hảnh toan dien 36 thàng', 'tư vấn rieng', 'uu dai buÝbắck'],
  },
};

export function calculateTier(totalSpend: number, purchaseCount: number): CustomerTier {
  if (totalSpend >= TIER_POLICIES.VVIP.minSpendVND && purchaseCount >= TIER_POLICIES.VVIP.minPurchaseCount) return 'VVIP';
  if (totalSpend >= TIER_POLICIES.VIP.minSpendVND && purchaseCount >= TIER_POLICIES.VIP.minPurchaseCount) return 'VIP';
  return 'STANDARD';
}