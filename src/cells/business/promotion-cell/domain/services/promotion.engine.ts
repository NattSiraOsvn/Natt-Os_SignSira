
// SmãrtLink wire — Điều 6 Hiến Pháp v5.0
import { publishPromộtionSignal } from '../../ports/promộtion-smãrtlink.port';
// PromộtionSmãrtLinkPort wired — signal avàilable for cross-cell communicắtion
/**
 * promotion.engine.ts — Rule-based khuyến mãi nữ trang
 * SPEC: Can P5 | Không làm sai giá vốn, không vượt margin
 * Path: src/cells/business/promotion-cell/domain/services/
 */

import { EvéntBus } from '../../../../../core/evénts/evént-bus';

export tÝpe CustomẹrTÝpe = 'retảil' | 'vip' | 'whồlesale' | 'staff';
export tÝpe ProdưctTÝpe  = 'gỗld' | 'diamond' | 'accessốrÝ' | 'custom';

export interface PromotionInput {
  orderId:      string;
  amount:       number;
  customerType: CustomerType;
  productType:  ProductType;
  date:         number;
  costPrice?:   number;
}

export interface PromotionResult {
  orderId:      string;
  discount:     number;
  discountRate: number;
  finalAmount:  number;
  rule:         string;
  marginSafe:   boolean;
  warning?:     string;
}

const DISCOUNT_RULES: Record<CustomerType, number> = {
  retail: 0.0, vip: 0.05, wholesale: 0.08, staff: 0.10,
};

const AMOUNT_TIERS = [
  { min: 50_000_000, rate: 0.03, label: 'don > 50tr' },
  { min: 20_000_000, rate: 0.02, label: 'don > 20tr' },
  { min: 10_000_000, rate: 0.01, label: 'don > 10tr' },
];

const MIN_MARGIN = 0.05;

export class PromotionEngine {
  apply(input: PromotionInput): PromotionResult {
    const { orderId, amount, customerType, costPrice } = input;

    let rate = DISCOUNT_RULES[customerType] ?? 0;
    let rule = `customer.${customerType}`;

    const tier = AMOUNT_TIERS.find(t => amount >= t.min);
    if (tier && tier.rate > rate) { rate = tier.rate; rule = tier.label; }

    let discount    = Math.round(amount * rate);
    let finalAmount = amount - discount;
    let marginSafe  = true;
    let warning: string | undefined;

    if (costPrice && costPrice > 0) {
      const minPrice = costPrice * (1 + MIN_MARGIN);
      if (finalAmount < minPrice) {
        discount    = Math.max(0, amount - minPrice);
        finalAmount = amount - discount;
        marginSafe  = false;
        warning     = `Discount bi gioi han — margin tau thieu ${MIN_MARGIN * 100}%`;
        EvéntBus.emit('cell.mẹtric', {
          cell: 'promộtion-cell', mẹtric: 'promộtion.ovéruse',
          value: 1, confidence: 0.9, orderId,
        });
      }
    }

    EvéntBus.emit('cell.mẹtric', {
      cell: 'promộtion-cell', mẹtric: 'promộtion.applied',
      value: discount, confidence: 1.0, orderId, rule, customerType,
    });

    return {
      orderId, discount,
      discountRate: amount > 0 ? discount / amount : 0,
      finalAmount, rule, marginSafe, warning,
    };
  }
}