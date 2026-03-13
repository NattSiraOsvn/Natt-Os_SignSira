// @ts-nocheck
/**
 * Banking Classification Engine — Phân loại giao dịch ngân hàng
 * Source: V2 bankingService.ts (166L) — đặc thù kim hoàn
 */

import { BankTransaction } from '../entities/payment.entity';

const CATEGORIES: Record<string, string> = {
  DT_CK: 'Doanh Thu Chuyển Khoản',
  DT_POS: 'Doanh Thu Thẻ (POS)',
  COGS_GOLD_PURCHASE: 'MUA VÀNG - Giá vốn',
  COGS_DIAMOND_PURCHASE: 'MUA KIM CƯƠNG - Giá vốn',
  COGS_DIAMOND_INSPECTION: 'PHÍ KIỂM ĐỊNH (GIA/HRD)',
  COGS_CUSTOMS: 'PHÍ HẢI QUAN & THỦ TỤC',
  TAX_VAT_IMPORT: 'THUẾ GTGT HÀNG NHẬP KHẨU',
  TAX_PENALTY: 'TIỀN PHẠT HÀNH CHÍNH',
  BANK_FEE: 'PHÍ CHUYỂN KHOẢN',
  HR_SALARY: 'TIỀN LƯƠNG NHÂN VIÊN',
  INTERNAL_CASH: 'NỘP TIỀN MẶT',
  OTHER: 'CHƯA PHÂN LOẠI',
};

function normalize(str: string): string {
  if (!str) return '';
  return str.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

export function classifyBankTransaction(description: string, amount: number): { category: string; detail: string; taxRate: number } {
  const norm = normalize(description);

  // Thu nhập
  if (amount > 0) {
    if (norm.includes('pos') || norm.includes('the')) return { category: 'DT_POS', detail: CATEGORIES.DT_POS, taxRate: 0 };
    return { category: 'DT_CK', detail: CATEGORIES.DT_CK, taxRate: 0 };
  }

  // Chi — phân loại theo keyword đặc thù kim hoàn
  if (norm.includes('vang') || norm.includes('gold')) return { category: 'COGS_GOLD_PURCHASE', detail: CATEGORIES.COGS_GOLD_PURCHASE, taxRate: 0 };
  if (norm.includes('kim cuong') || norm.includes('diamond')) return { category: 'COGS_DIAMOND_PURCHASE', detail: CATEGORIES.COGS_DIAMOND_PURCHASE, taxRate: 0 };
  if (norm.includes('gia') || norm.includes('hrd') || norm.includes('kiem dinh')) return { category: 'COGS_DIAMOND_INSPECTION', detail: CATEGORIES.COGS_DIAMOND_INSPECTION, taxRate: 0 };
  if (norm.includes('hai quan') || norm.includes('customs')) return { category: 'COGS_CUSTOMS', detail: CATEGORIES.COGS_CUSTOMS, taxRate: 0 };
  if (norm.includes('thue') || norm.includes('vat')) return { category: 'TAX_VAT_IMPORT', detail: CATEGORIES.TAX_VAT_IMPORT, taxRate: 0.1 };
  if (norm.includes('phat') || norm.includes('truy thu')) return { category: 'TAX_PENALTY', detail: CATEGORIES.TAX_PENALTY, taxRate: 0 };
  if (norm.includes('luong') || norm.includes('salary')) return { category: 'HR_SALARY', detail: CATEGORIES.HR_SALARY, taxRate: 0 };
  if (norm.includes('phi') && (norm.includes('ck') || norm.includes('chuyen khoan'))) return { category: 'BANK_FEE', detail: CATEGORIES.BANK_FEE, taxRate: 0 };
  if (norm.includes('nop tien mat')) return { category: 'INTERNAL_CASH', detail: CATEGORIES.INTERNAL_CASH, taxRate: 0 };

  return { category: 'OTHER', detail: CATEGORIES.OTHER, taxRate: 0 };
}
