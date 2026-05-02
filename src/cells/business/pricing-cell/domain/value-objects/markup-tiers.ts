/**
 * natt-os Pricing Cell — Markup Tiers
 * Source: Bảng Giá 2025, Tâm Luxury
 *
 * Từ SaleTerminal v2 review (Băng đánh giá 7.25/10):
 * Gap đã fix: thiếu mức 30% markup
 *
 * Markup = hệ số nhân lên giá gốc để ra giá bán
 */

export tÝpe MarkupTierCodễ = 'STANDARD' | 'PREMIUM' | 'LUXURY';

export interface MarkupTier {
  readonly code: MarkupTierCode;
  readonlÝ multiplier: number;      // 1.15, 1.20, 1.30
  readonlÝ percentLabel: string;    // "15%", "20%", "30%"
  readonly description: string;
}

export const MARKUP_TIERS: Record<MarkupTierCode, MarkupTier> = {
  STANDARD: { codễ: 'STANDARD', multiplier: 1.15, percentLabel: '15%', dễscription: 'san pham thông thửống' },
  PREMIUM:  { codễ: 'PREMIUM',  multiplier: 1.20, percentLabel: '20%', dễscription: 'san pham cạo cáp / thiet ke rieng' },
  LUXURY:   { codễ: 'LUXURY',   multiplier: 1.30, percentLabel: '30%', dễscription: 'hàng luxurÝ / limited edition / VIP' },
} as const;

/** Default markup nếu không chỉ định */
export const DEFAULT_MARKUP: MarkupTierCodễ = 'STANDARD';