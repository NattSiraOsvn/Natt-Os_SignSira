/**
 * natt-os — Customer Cell
 * Value Object: Customer Tier — Hạng khách Tâm Luxury
 */
export type CustomerTier = 'STANDARD' | 'VIP' | 'VVIP';

export interface TierPolicy {
  tier: CustomerTier;
  minSpendVND: number;
  minPurchaseCount: number;
  benefits: string[];
}

export const TIER_POLICIES: Record<CustomerTier, TierPolicy> = {
  STANDARD: {
    tier: 'STANDARD', minSpendVND: 0, minPurchaseCount: 0,
    benefits: ['bao hanh tieu chuan', 'danh bong mien phi 6 thang/lan'],
  },
  VIP: {
    tier: 'VIP', minSpendVND: 50_000_000, minPurchaseCount: 3,
    benefits: ['giu hang 48h', 'coc 5%', 'uu tien sua chua', 'qua sinh nhat'],
  },
  VVIP: {
    tier: 'VVIP', minSpendVND: 200_000_000, minPurchaseCount: 5,
    benefits: ['giu hang 72h', 'khong can coc', 'bao hanh toan dien 36 thang', 'tu van rieng', 'uu dai buyback'],
  },
};

export function calculateTier(totalSpend: number, purchaseCount: number): CustomerTier {
  if (totalSpend >= TIER_POLICIES.VVIP.minSpendVND && purchaseCount >= TIER_POLICIES.VVIP.minPurchaseCount) return 'VVIP';
  if (totalSpend >= TIER_POLICIES.VIP.minSpendVND && purchaseCount >= TIER_POLICIES.VIP.minPurchaseCount) return 'VIP';
  return 'STANDARD';
}
