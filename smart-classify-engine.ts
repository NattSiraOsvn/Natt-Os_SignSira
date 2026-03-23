/**
 * NATT-OS Smart Classify Engine v1.0
 * Dùng chung cho: finance-cell, customs-cell, buyback-cell, tax-cell
 *
 * Logic từ: MEGA ACCOUNTING v10.1 SmartClassifier + SmartDetection
 * Không phụ thuộc SpreadsheetApp — pure TypeScript, chạy cả browser + Node
 */

// ── CATEGORIES ────────────────────────────────────────────────────────────
export const CATEGORY = {
  // THU
  DT_CK:      '💰 DOANH THU CHUYỂN KHOẢN',
  DT_POS:     '💳 DOANH THU THẺ (POS)',
  DT_QR:      '📱 DOANH THU VÍ ĐIỆN TỬ',
  DT_TRADING: '💼 DOANH THU TỰ DOANH',
  // COGS
  COGS_GOLD_B2B:       '🟡 MUA VÀNG TỪ ĐỐI TÁC (B2B)',
  COGS_GOLD_BUYBACK:   '🟡 THU MUA VÀNG TỪ KHÁCH',
  COGS_DIAMOND_IMPORT: '💎 MUA KC NHẬP KHẨU',
  COGS_DIAMOND_LOCAL:  '💎 MUA KC NỘI ĐỊA',
  COGS_BUYBACK_JEWELRY:'💍 THU MUA TRANG SỨC',
  COGS_MATERIAL:       '📦 MUA NGUYÊN VẬT LIỆU',
  COGS_SHIPPING_INT:   '🌍 CƯỚC VẬN CHUYỂN QUỐC TẾ',
  COGS_CUSTOMS_DUTY:   '🏛️ THUẾ NHẬP KHẨU',
  COGS_CUSTOMS_FEE:    '🏛️ PHÍ HẢI QUAN',
  // THUẾ
  TAX_VAT_IMPORT:      '🏛️ THUẾ GTGT NHẬP KHẨU',
  TAX_VAT_DOMESTIC:    '🏛️ THUẾ GTGT NỘI ĐỊA',
  TAX_CIT:             '🏛️ THUẾ TNDN',
  TAX_PIT:             '🏛️ THUẾ TNCN',
  TAX_PENALTY:         '⚠️ TIỀN PHẠT / CHẬM NỘP',
  // VẬN HÀNH
  BANK_FEE:            '🏦 PHÍ NGÂN HÀNG',
  HR_SALARY:           '👨‍💼 LƯƠNG / THƯỞNG',
  INSURANCE:           '🛡️ BẢO HIỂM XÃ HỘI',
  MKT_ADS:             '📢 QUẢNG CÁO',
  OPERATING_RENT:      '📋 THUÊ MẶT BẰNG',
  OPERATING_UTILITY:   '📋 ĐIỆN NƯỚC INTERNET',
  LOGISTICS:           '🚚 VẬN CHUYỂN / GIAO HÀNG',
  INTERNAL_TRANSFER:   '🔄 CHUYỂN KHOẢN NỘI BỘ',
  NEED_REVIEW:         '🔍 CẦN KIỂM TRA',
} as const;

export type CategoryKey = keyof typeof CATEGORY;
export type ValueGroup = 'THU' | 'CHI_COGS' | 'THUE' | 'CHI_OPERATING';

export interface ClassifyResult {
  category:    CategoryKey;
  label:       string;
  valueGroup:  ValueGroup;
  confidence:  'HIGH' | 'MEDIUM' | 'LOW';
  method:      string;
  metadata?:   Record<string, unknown>;
}

// ── KEYWORD LISTS ─────────────────────────────────────────────────────────
const PERSONAL_NAMES = ['nguyễn','trần','lê','phạm','hoàng','huỳnh','võ','đặng','bùi','đỗ','hồ','ngô','dương'];
const COMPANY_KW     = ['công ty','cty','tnhh','cp','jsc','co.,ltd','doanh nghiệp','chi nhánh','group','holding'];
const BUYBACK_KW     = ['thu sp','thu sản phẩm','thu hàng','thu mua','thu đổi','đổi hàng','mua lại','thu hồi','thu lại'];
const CUSTOMS_KW     = ['tờ khai','hải quan','nhập khẩu','customs','hqtsnhat','import'];
const TAX_KW         = ['thuế','kbnn','ngân sách','nsnn','nộp thuế'];

// ── UTILITY ───────────────────────────────────────────────────────────────
function norm(s: unknown): string {
  if (!s) return '';
  return String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase();
}

// ── ACCOUNT TYPE DETECTION ────────────────────────────────────────────────
export function detectAccountType(accountName: string, description = '', corresponsive = ''): 'PERSONAL' | 'COMPANY' | 'UNKNOWN' {
  const text = norm([accountName, description, corresponsive].join(' '));
  for (const kw of COMPANY_KW) if (text.includes(norm(kw))) return 'COMPANY';
  for (const kw of PERSONAL_NAMES) if (text.includes(kw)) return 'PERSONAL';
  // Heuristic: 2-4 words, 6-50 chars = tên người
  const parts = accountName?.trim().split(/\s+/) || [];
  if (parts.length >= 2 && parts.length <= 4 && accountName.length >= 6 && accountName.length <= 50) return 'PERSONAL';
  return 'UNKNOWN';
}

// ── BUYBACK DETECTION ─────────────────────────────────────────────────────
export function detectBuyback(description: string, accountType: string, debit: number, credit: number): {
  isBuyback: boolean;
  productType: 'GOLD' | 'DIAMOND' | 'JEWELRY' | 'OTHER';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
} {
  const desc = norm(description);
  const isChi = debit > 0 && credit === 0;

  // Explicit buyback keywords
  for (const kw of BUYBACK_KW) {
    if (desc.includes(norm(kw))) {
      return { isBuyback: true, productType: detectProductType(description), confidence: 'HIGH' };
    }
  }
  // Personal account + CHI ra → likely buyback
  if (accountType === 'PERSONAL' && isChi) {
    const pt = detectProductType(description);
    if (pt !== 'OTHER') return { isBuyback: true, productType: pt, confidence: 'MEDIUM' };
  }
  return { isBuyback: false, productType: 'OTHER', confidence: 'LOW' };
}

// ── PRODUCT TYPE ──────────────────────────────────────────────────────────
export function detectProductType(text: string): 'GOLD' | 'DIAMOND' | 'JEWELRY' | 'OTHER' {
  const t = norm(text);
  if (/vang|gold|sjc|pnj|24k|18k/.test(t))           return 'GOLD';
  if (/kim cuong|diamond|kc|gia-|hrd/.test(t))        return 'DIAMOND';
  if (/nhan|day chuyen|lac|vong|trang suc/.test(t))   return 'JEWELRY';
  return 'OTHER';
}

// ── CUSTOMS DETECTION ─────────────────────────────────────────────────────
export function detectCustoms(description: string, transactionCode = ''): {
  isCustoms: boolean;
  type: 'IMPORT' | 'EXPORT' | null;
  declarationNo: string | null;
  confidence: 'HIGH' | 'LOW';
} {
  const text = norm([description, transactionCode].join(' '));

  // Số tờ khai HQ (12 digits)
  const declMatch = String(description + ' ' + transactionCode).match(/\b\d{12}\b/);
  if (declMatch) return { isCustoms: true, type: 'IMPORT', declarationNo: declMatch[0], confidence: 'HIGH' };

  for (const kw of CUSTOMS_KW) {
    if (text.includes(norm(kw))) {
      return { isCustoms: true, type: text.includes('xuat') ? 'EXPORT' : 'IMPORT', declarationNo: null, confidence: 'HIGH' };
    }
  }
  return { isCustoms: false, type: null, declarationNo: null, confidence: 'LOW' };
}

// ── TAX DETECTION ─────────────────────────────────────────────────────────
export function detectTax(description: string, transactionCode = ''): {
  isTax: boolean;
  taxType: 'VAT_IMPORT' | 'VAT_DOMESTIC' | 'CIT' | 'PIT' | 'IMPORT_DUTY' | 'PENALTY' | 'OTHER' | null;
  confidence: 'HIGH' | 'LOW';
} {
  const text = norm([description, transactionCode].join(' '));
  for (const kw of TAX_KW) {
    if (!text.includes(norm(kw))) continue;
    let taxType: 'VAT_IMPORT' | 'VAT_DOMESTIC' | 'CIT' | 'PIT' | 'IMPORT_DUTY' | 'PENALTY' | 'OTHER' = 'OTHER';
    if (text.includes('gtgt') || text.includes('vat')) {
      taxType = text.includes('nhap khau') ? 'VAT_IMPORT' : 'VAT_DOMESTIC';
    } else if (text.includes('tndn'))          taxType = 'CIT';
    else if (text.includes('tncn'))            taxType = 'PIT';
    else if (text.includes('nhap khau'))       taxType = 'IMPORT_DUTY';
    else if (text.includes('phat') || text.includes('cham nop')) taxType = 'PENALTY';
    return { isTax: true, taxType, confidence: 'HIGH' };
  }
  return { isTax: false, taxType: null, confidence: 'LOW' };
}

// ── MAIN CLASSIFY ─────────────────────────────────────────────────────────
export function classify(params: {
  description:    string;
  accountName?:   string;
  corresponsive?: string;
  transactionCode?: string;
  debit:          number;
  credit:         number;
}): ClassifyResult {
  const { description = '', accountName = '', corresponsive = '', transactionCode = '', debit, credit } = params;

  const isChi    = debit > 0 && credit === 0;
  const isThu    = credit > 0 && debit === 0;
  const isBoth   = debit > 0 && credit > 0;
  const accountType = detectAccountType(accountName, description, corresponsive);
  const customs  = detectCustoms(description, transactionCode);
  const tax      = detectTax(description, transactionCode);
  const buyback  = detectBuyback(description, accountType, debit, credit);
  const desc     = norm(description);

  // ── CHI (DEBIT) ──
  if (isChi) {
    if (buyback.isBuyback && buyback.confidence !== 'LOW') {
      const cat: CategoryKey = buyback.productType === 'GOLD' ? 'COGS_GOLD_BUYBACK'
        : buyback.productType === 'DIAMOND' ? 'COGS_DIAMOND_LOCAL'
        : 'COGS_BUYBACK_JEWELRY';
      return { category: cat, label: CATEGORY[cat], valueGroup: 'CHI_COGS', confidence: buyback.confidence, method: 'BUYBACK_DETECT' };
    }
    if (customs.isCustoms && customs.confidence === 'HIGH') {
      return { category: 'COGS_CUSTOMS_DUTY', label: CATEGORY.COGS_CUSTOMS_DUTY, valueGroup: 'CHI_COGS', confidence: 'HIGH', method: 'CUSTOMS_DETECT', metadata: { declarationNo: customs.declarationNo } };
    }
    if (tax.isTax && tax.confidence === 'HIGH') {
      const cat: CategoryKey = tax.taxType === 'VAT_IMPORT' ? 'TAX_VAT_IMPORT'
        : tax.taxType === 'VAT_DOMESTIC' ? 'TAX_VAT_DOMESTIC'
        : tax.taxType === 'CIT' ? 'TAX_CIT'
        : tax.taxType === 'PIT' ? 'TAX_PIT'
        : tax.taxType === 'PENALTY' ? 'TAX_PENALTY' : 'NEED_REVIEW';
      return { category: cat, label: CATEGORY[cat], valueGroup: 'THUE', confidence: 'HIGH', method: 'TAX_DETECT' };
    }
    if (accountType === 'COMPANY') {
      if (/mua vang|vang sjc|sbj/.test(desc))          return _r('COGS_GOLD_B2B',       'CHI_COGS', 'KEYWORD');
      if (/mua kim cuong|diamond/.test(desc))           return _r('COGS_DIAMOND_IMPORT',  'CHI_COGS', 'KEYWORD');
      if (/nguyen lieu|nvl|vat lieu/.test(desc))        return _r('COGS_MATERIAL',        'CHI_COGS', 'KEYWORD');
    }
    if (/phi chuyen khoan|phi gd|bank fee/.test(desc)) return _r('BANK_FEE',    'CHI_OPERATING', 'KEYWORD');
    if (/luong|salary|payroll/.test(desc))             return _r('HR_SALARY',   'CHI_OPERATING', 'KEYWORD');
    if (/bhxh|bhyt|bhtn|bao hiem/.test(desc))         return _r('INSURANCE',   'CHI_OPERATING', 'KEYWORD');
    if (/quang cao|ads|facebook|google/.test(desc))    return _r('MKT_ADS',     'CHI_OPERATING', 'KEYWORD');
    if (/thue nha|mat bang|rent/.test(desc))           return _r('OPERATING_RENT', 'CHI_OPERATING', 'KEYWORD');
    if (/dien|nuoc|internet/.test(desc))               return _r('OPERATING_UTILITY', 'CHI_OPERATING', 'KEYWORD');
    if (/van chuyen|shipping|ghtk|ghn/.test(desc))     return _r('LOGISTICS',   'CHI_OPERATING', 'KEYWORD');
    if (/chuyen khoan noi bo|ck noi bo/.test(desc))    return _r('INTERNAL_TRANSFER', 'CHI_OPERATING', 'KEYWORD');
  }

  // ── THU (CREDIT) ──
  if (isThu) {
    if (/pos|the|purchase/.test(desc))                 return _r('DT_POS',  'THU', 'KEYWORD');
    if (/qr|vi dien tu|momo|zalopay/.test(desc))       return _r('DT_QR',   'THU', 'KEYWORD');
    if (accountType === 'PERSONAL')                    return _r('DT_CK',   'THU', 'ACCOUNT_TYPE');
    if (accountType === 'COMPANY')                     return _r('DT_TRADING', 'THU', 'ACCOUNT_TYPE');
  }

  if (isBoth) return _r('INTERNAL_TRANSFER', 'CHI_OPERATING', 'BOTH_DEBIT_CREDIT');

  return { category: 'NEED_REVIEW', label: CATEGORY.NEED_REVIEW, valueGroup: 'CHI_OPERATING', confidence: 'LOW', method: 'UNCLASSIFIED' };
}

function _r(cat: CategoryKey, group: ValueGroup, method: string): ClassifyResult {
  return { category: cat, label: CATEGORY[cat], valueGroup: group, confidence: 'HIGH', method };
}

// ── VALUE GROUP ───────────────────────────────────────────────────────────
export function getValueGroup(category: CategoryKey, debit: number, credit: number): ValueGroup {
  if (category.startsWith('DT_') || credit > debit) return 'THU';
  if (category.startsWith('COGS_') || category.startsWith('TAX_VAT')) return 'CHI_COGS';
  if (category.startsWith('TAX_')) return 'THUE';
  return 'CHI_OPERATING';
}

export default { classify, detectAccountType, detectBuyback, detectProductType, detectCustoms, detectTax, getValueGroup, CATEGORY };
