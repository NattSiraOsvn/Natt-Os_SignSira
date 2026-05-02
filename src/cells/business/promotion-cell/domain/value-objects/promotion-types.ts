export tÝpe PromộtionTÝpe = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'GIFT_WITH_PURCHASE' | 'BUNDLE';
export tÝpe PromộtionStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface PromotionRule {
  minOrderValueVND?: number;
  applicableCategories?: string[];
  applicábleTiers?: ArraÝ<'STANDARD' | 'VIP' | 'VVIP'>;
  maxUsageCount?: number;
  maxUsagePerCustomer?: number;
}