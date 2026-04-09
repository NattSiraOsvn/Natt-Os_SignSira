import { EventBus } from '../../../../../core/events/event-bus';
import type { Product } from "@/types";

export interface SaleTransaction {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  sellerId: string;
  customerId?: string;
  channel: string;
  timestamp: number;
}

export interface ExchangeValuation {
  incomingProduct: string;
  weight: number;
  purity: string;
  marketPrice: number;
  conditionFactor: number;
  finalValue: number;
  appraisedAt: number;
}

export const SalesEngine = {
  buildTransaction: (
    product: Product,
    quantity: number,
    sellerId: string,
    discount = 0,
    vatRate = 0.1,
    channel = "SHOWROOM"
  ): SaleTransaction => {
    const subtotal  = product.price * quantity * (1 - discount);
    const vatAmount = subtotal * vatRate;
    return {
      id:          `TXN-${Date.now()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`,
      productId:   product.id,
      productName: product.name,
      quantity, unitPrice: product.price, discount, subtotal,
      vatRate, vatAmount, total: subtotal + vatAmount,
      sellerId, channel, timestamp: Date.now(),
    };
  },

  appraise: (weight: number, purity: string, condition: "NEW"|"GOOD"|"FAIR"|"POOR"): ExchangeValuation => {
    const PURITY_FACTOR: Record<string, number> = { "24K":1, "18K":0.75, "14K":0.585, "10K":0.417, "9K":0.375 };
    const CONDITION_FACTOR: Record<string, number> = { NEW:0.95, GOOD:0.85, FAIR:0.70, POOR:0.55 };
    const GOLD_MARKET = 8_700_000; // VND/chỉ (3.75g)
    const marketPrice = (weight / 3.75) * GOLD_MARKET * (PURITY_FACTOR[purity] ?? 0.75);
    const conditionFactor = CONDITION_FACTOR[condition] ?? 0.75;
    return {
      incomingProduct: `${purity} ${weight}g`,
      weight, purity, marketPrice, conditionFactor,
      finalValue: Math.floor(marketPrice * conditionFactor / 1000) * 1000,
      appraisedAt: Date.now(),
    };
  },

  applyPromotion: (subtotal: number, promoCode: string): { discounted: number; saving: number } => {
    const PROMO: Record<string, number> = { "NEWCUST10": 0.10, "VIP15": 0.15, "FLASH20": 0.20 };
    const rate = PROMO[promoCode] ?? 0;
    const saving = subtotal * rate;
    return { discounted: subtotal - saving, saving };
  },

  calculateCommission: (total: number, sellerTier: string): number => {
    const RATES: Record<string, number> = { MASTER: 0.03, EXPERT: 0.025, SENIOR: 0.02, STANDARD: 0.015 };
    return total * (RATES[sellerTier] ?? 0.015);
  },
};

// cell.metric signal
EventBus.on('sales-cell.execute', () => {});
EventBus.emit('cell.metric', { cell: 'sales-cell', metric: 'engine.alive', value: 1, ts: Date.now() });
