// @ts-nocheck
/**
 * Finance Engine — Tính thuế GTGT trực tiếp + cảnh báo margin
 * 
 * CẢNH BÁO CAN + KRIS:
 * - KHÔNG hard-code thuế = (DT - GV) × 10%
 * - KHÔNG dùng DEFAULT_COGS_RATE
 * - Phải có 3 MODE: GROUND_TRUTH / PROVISIONAL / INVESTIGATION
 */

import { JournalEntry, ACCOUNTS } from '../entities/journal-entry.entity';

export type FinanceMode = 'GROUND_TRUTH' | 'PROVISIONAL' | 'INVESTIGATION';

const SAFE_MARGIN_THRESHOLD = 0.87;

export interface MarginAlert {
  ratio: number;
  isAlert: boolean;
  level: 'SAFE' | 'WARNING' | 'DANGER';
  explanation: string;
}

/** Kiểm tra margin — cảnh báo >87% */
export function checkMargin(revenue: number, cogs: number): MarginAlert {
  if (revenue <= 0) return { ratio: 0, isAlert: false, level: 'SAFE', explanation: 'Chưa có doanh thu' };
  
  const ratio = cogs / revenue;
  const level = ratio > SAFE_MARGIN_THRESHOLD ? 'DANGER' : ratio > 0.80 ? 'WARNING' : 'SAFE';

  return {
    ratio,
    isAlert: ratio > SAFE_MARGIN_THRESHOLD,
    level,
    explanation: level === 'DANGER'
      ? `Giá vốn/Doanh thu = ${(ratio * 100).toFixed(1)}% > 87% — CẦN KIỂM TRA NGAY`
      : `Giá vốn/Doanh thu = ${(ratio * 100).toFixed(1)}% — ${level}`,
  };
}

/** Phân loại TK Nợ tự động dựa trên mô tả (from V2 TaxCell Normalize.accountByKeywords) */
export function classifyDebitAccount(description: string, amount: number): string {
  const text = description.toUpperCase();
  
  // TSCĐ
  if (amount >= 30000000) {
    if (/MÁY|LÒ ĐÚC|IMAC|PC|SERVER/.test(text)) return ACCOUNTS.FIXED_ASSET;
    if (/PHẦN MỀM|BẢN QUYỀN|LICENSE/.test(text)) return ACCOUNTS.INTANGIBLE;
  }
  if (/BÀN|GHẾ|TỦ|KỆ/.test(text)) return amount >= 30000000 ? ACCOUNTS.FIXED_ASSET : ACCOUNTS.INV_CCDC;
  
  // Nguyên liệu
  if (/VIÊN CHỦ|GIA/.test(text)) return ACCOUNTS.INV_MAT;
  if (/DÂY CHUYỀN|MOISSANITE|ĐÁ/.test(text)) return ACCOUNTS.INV_GOODS;
  if (/BÌA KIM CƯƠNG|HỘP|TÚI/.test(text)) return ACCOUNTS.INV_MAT;
  if (/PHỤ GIA|HOÁ CHẤT|RESIN|GAS/.test(text)) return ACCOUNTS.INV_MAT;
  if (/CÔNG CỤ|DỤNG CỤ/.test(text)) return ACCOUNTS.INV_CCDC;
  
  // Chi phí
  if (/ADS|QUẢNG CÁO|META|GOOGLE|SHOPEE|VẬN CHUYỂN|SHIP/.test(text)) return ACCOUNTS.SELLING_EXP;
  if (/ĐIỆN|NƯỚC|INTERNET|VỆ SINH|BẢO VỆ|PHÂN KIM|KIỂM ĐỊNH/.test(text)) return ACCOUNTS.ADMIN_EXP;
  if (/LƯƠNG|THƯỞNG/.test(text)) return ACCOUNTS.SALARY_PAYABLE;
  
  return ACCOUNTS.ADMIN_EXP;
}
