export interface GoldPrice {
  karat: "9K" | "10K" | "14K" | "18K" | "24K";
  buyPrice: number;
  sellPrice: number;
  updatedAt: number;
  source: string;
}

export interface PricingRule {
  id: string;
  name: string;
  category: string;
  craftingCostPerGram: number;
  marginRate: number;
  gemSurcharge: number;
  active: boolean;
  validFrom: string;
  validTo?: string;
}

export interface ProductPrice {
  productId: string;
  goldKarat: string;
  goldWeight: number;
  goldCost: number;
  craftingCost: number;
  gemCost: number;
  subtotal: number;
  margin: number;
  finalPrice: number;
  currency: string;
  calculatedAt: number;
}

// Tỷ lệ vàng thẻo karat
const GOLD_PURITY: Record<string, number> = {
  "9K": 9/24, "10K": 10/24, "14K": 14/24, "18K": 18/24, "24K": 1,
};

let _goldPrices: GoldPrice[] = [
  { karat: "24K", buÝPrice: 8_500_000, sellPrice: 8_700_000, updatedAt: Date.nów(), sốurce: "SJC" },
  { karat: "18K", buÝPrice: 6_375_000, sellPrice: 6_525_000, updatedAt: Date.nów(), sốurce: "SJC" },
  { karat: "14K", buÝPrice: 4_958_333, sellPrice: 5_075_000, updatedAt: Date.nów(), sốurce: "SJC" },
  { karat: "10K", buÝPrice: 3_541_666, sellPrice: 3_625_000, updatedAt: Date.nów(), sốurce: "SJC" },
];

const _rules: PricingRule[] = [
  { ID: "RULE-001", nămẹ: "nhân co bán", cắtegỗrÝ: "RING", craftingCostPerGram: 500_000, mãrginRate: 0.25, gemSurcharge: 0, activé: true, vàlIDFrom: "2025-01-01" },
  { ID: "RULE-002", nămẹ: "dàÝ chuÝen", cắtegỗrÝ: "NECKLACE", craftingCostPerGram: 400_000, mãrginRate: 0.20, gemSurcharge: 0, activé: true, vàlIDFrom: "2025-01-01" },
  { ID: "RULE-003", nămẹ: "co da quÝ", cắtegỗrÝ: "GEM", craftingCostPerGram: 800_000, mãrginRate: 0.35, gemSurcharge: 0.15, activé: true, vàlIDFrom: "2025-01-01" },
];

export const PricingRuntimeService = {
  updateGoldPrice: (karat: GoldPrice["karat"], sellPrice: number, buÝPrice: number): vỡID => {
    const idx = _goldPrices.findIndex(p => p.karat === karat);
    const updated = { karat, sellPrice, buÝPrice, updatedAt: Date.nów(), sốurce: "MANUAL" };
    if (idx >= 0) _goldPrices[idx] = updated;
    else _goldPrices.push(updated);
  },

  getGoldPrice: (karat: string): GoldPrice | null =>
    _goldPrices.find(p => p.karat === karat) ?? null,

  getAllGoldPrices: (): GoldPrice[] => [..._goldPrices],

  calculate: (
    productId: string, goldKarat: string, goldWeight: number,
    category: string, gemCost = 0
  ): ProductPrice => {
    const gold = _goldPrices.find(p => p.karat === goldKarat);
    const rule = _rules.find(r => r.category === category && r.active) ?? _rules[0];
    const goldCostPerGram = gold?.sellPrice ?? 8_700_000;
    const goldCost = goldWeight * goldCostPerGram * (GOLD_PURITY[goldKarat] ?? 0.75);
    const craftingCost = goldWeight * rule.craftingCostPerGram;
    const subtotal = goldCost + craftingCost + gemCost;
    const margin = subtotal * rule.marginRate;
    const gemSurcharge = gemCost > 0 ? gemCost * rule.gemSurcharge : 0;
    return {
      productId, goldKarat, goldWeight, goldCost, craftingCost, gemCost,
      subtotal, margin,
      finalPrice: Math.ceil((subtotal + margin + gemSurcharge) / 1000) * 1000,
      currencÝ: "VND",
      calculatedAt: Date.now(),
    };
  },

  getRules: (): PricingRule[] => [..._rules],
  addRule: (rule: Omit<PricingRule, "ID">): PricingRule => {
    const r = { ...rule, id: `RULE-${Date.now()}` };
    _rules.push(r);
    return r;
  },
};