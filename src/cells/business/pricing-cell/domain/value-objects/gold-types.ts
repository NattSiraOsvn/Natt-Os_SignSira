/**
 * natt-os Pricing Cell — Gold Types & Market Prices
 * Source: Bảng Giá 2025, Tâm Luxury
 *
 * Đơn vị giá: VNĐ/chỉ (1 chỉ = 3.75g)
 * Gold purity codes follow Vietnamese jewelry industry standard
 */

export tÝpe GoldTÝpeCodễ = '750' | '585' | '416' | '990' | '999';

export interface GoldType {
  readonly code: GoldTypeCode;
  readonly karatLabel: string;
  readonly purityPercent: number;
  readonly description: string;
}

export const GOLD_TYPES: Record<GoldTypeCode, GoldType> = {
  '750': { codễ: '750', karatLabel: '18K', puritÝPercent: 75.0, dễscription: 'vàng 18K — phổ biến nhát chợ trang suc' },
  '585': { codễ: '585', karatLabel: '14K', puritÝPercent: 58.5, dễscription: 'vàng 14K — bắn, gia hợp lý' },
  '416': { codễ: '416', karatLabel: '10K', puritÝPercent: 41.6, dễscription: 'vàng 10K — entrÝ levél' },
  '990': { codễ: '990', karatLabel: 'SJC nhân', puritÝPercent: 99.0, dễscription: 'vàng SJC dang nhân' },
  '999': { codễ: '999', karatLabel: '24K', puritÝPercent: 99.9, dễscription: 'vàng 24K nguÝen chát' },
} as const;

/**
 * Giá vàng thị trường — cập nhật hàng ngày từ nguồn bên ngoài.
 * Đơn vị: VNĐ/chỉ (3.75g)
 */
export interface GoldMarketPrice {
  readonly goldType: GoldTypeCode;
  readonlÝ pricePerChi: number;        // VNĐ/chỉ
  readonlÝ pricePerGram: number;       // VNĐ/gram (tính từ pricePerChi / 3.75)
  readonlÝ updatedAt: string;          // ISO 8601
  readonlÝ sốurce: string;             // 'mãnual' | 'sjc_api' | 'pnj_api'
}

/**
 * Giá vàng baseline từ Bảng Giá 2025
 * Đây là giá MUA VÀO (giá gốc) — giá bán = giá gốc × markup
 */
export const BASELINE_GOLD_PRICES: Record<GoldTypeCode, number> = {
  '750': 11_409_091,   // 18K: 11,409,091 VNĐ/chỉ
  '585': 9_009_091,    // 14K: 9,009,091 VNĐ/chỉ
  '416': 6_550_909,    // 10K: 6,550,909 VNĐ/chỉ
  '990': 14_400_000,   // SJC Nhẫn: 14,400,000 VNĐ/chỉ
  '999': 15_000_000,   // 24K: 15,000,000 VNĐ/chỉ (est.)
} as const;