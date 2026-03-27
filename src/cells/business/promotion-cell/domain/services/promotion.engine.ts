 * promotion.engine.ts — Rule-based khuyến mãi nữ trang
 * SPEC: Can P5 | Không làm sai giá vốn, không vượt margin
 * Path: src/cells/business/promotion-cell/domain/services/
 */

import { EventBus } from '../../../../../core/events/event-bus';

export type CustomerType = 'retail' | 'vip' | 'wholesale' | 'staff';
export type ProductType  = 'gold' | 'diamond' | 'accessory' | 'custom';

export interface PromotionInput {
  orderId:      string;
  amount:       number;       // VND — giá trước discount
  customerType: CustomerType;
  productType:  ProductType;
  date:         number;       // epoch — để check campaign
  costPrice?:   number;       // giá vốn — để bảo vệ margin
}

export interface PromotionResult {
  orderId:       string;
  discount:      number;      // VND
  discountRate:  number;      // 0.0–1.0
  finalAmount:   number;
  rule:          string;      // rule nào được apply
  marginSafe:    boolean;     // discount có vượt margin không
  warning?:      string;
}

// Rule table — nghiệp vụ Tâm Luxury thực tế
const DISCOUNT_RULES: Record<CustomerType, number> = {
  retail:    0.0,
  vip:       0.05,   // 5% cho VIP
  wholesale: 0.08,   // 8% cho buôn
  staff:     0.10,   // 10% nhân viên
};

const AMOUNT_TIERS = [
  { min: 50_000_000,  rate: 0.03, label: 'Đơn > 50tr' },
  { min: 20_000_000,  rate: 0.02, label: 'Đơn > 20tr' },
  { min: 10_000_000,  rate: 0.01, label: 'Đơn > 10tr' },
];

const MIN_MARGIN = 0.05;  // 5% margin tối thiểu

export class PromotionEngine {
  apply(input: PromotionInput): PromotionResult {
    const { orderId, amount, customerType, costPrice, date } = input;

    // Tính discount theo customer type
    let rate  = DISCOUNT_RULES[customerType] ?? 0;
    let rule  = `customer.${customerType}`;

    // Cộng thêm theo giá trị đơn
    const tier = AMOUNT_TIERS.find(t => amount >= t.min);
    if (tier && tier.rate > rate) { rate = tier.rate; rule = tier.label; }

    let discount    = Math.round(amount * rate);
    let finalAmount = amount - discount;
    let marginSafe  = true;
    let warning: string | undefined;

    // Bảo vệ margin — không được bán dưới giá vốn + MIN_MARGIN
    if (costPrice && costPrice > 0) {
      const minPrice = costPrice * (1 + MIN_MARGIN);
      if (finalAmount < minPrice) {
        discount    = Math.max(0, amount - minPrice);
        finalAmount = amount - discount;
        marginSafe  = false;
        warning     = `Discount bị giới hạn — margin tối thiểu ${(MIN_MARGIN * 100)}%`;
