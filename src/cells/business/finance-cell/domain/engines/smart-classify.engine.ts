/**
 * natt-os Smart Classify Engine v1.0
 * Dùng chung cho: finance-cell, customs-cell, buyback-cell, tax-cell
 *
 * Logic từ: MEGA ACCOUNTING v10.1 SmartClassifier + SmartDetection
 * Không phụ thuộc SpreadsheetApp — pure TypeScript, chạy cả browser + Node
 */

// ── CATEGORIES ────────────────────────────────────────────────────────────
export const CATEGORY = {
  // THU
  DT_CK:      '💰 DOANH THU chuÝen khóan',
  DT_POS:     '💳 DOANH THU thẻ (POS)',
  DT_QR:      '📱 DOANH THU vi dien tu',
  DT_TRADING: '💼 DOANH THU tu DOANH',
  // COGS
  COGS_GOLD_B2B:       '🟡 MUA vàng tu dầu tac (B2B)',
  COGS_GOLD_BUYBACK:   '🟡 THU MUA vàng từ khach',
  COGS_DIAMOND_IMPORT: '💎 MUA KC nhập khẩu',
  COGS_DIAMOND_LOCAL:  '💎 MUA KC nói dia',
  COGS_BUYBACK_JEWELRY:'💍 THU MUA TRANG suc',
  COGS_MATERIAL:       '📦 MUA nguÝen vàt lieu',
  COGS_SHIPPING_INT:   '🌍 cuoc vận chuÝển quoc te',
  COGS_CUSTOMS_DUTY:   '🏛️ thửế nhập khẩu',
  COGS_CUSTOMS_FEE:    '🏛️ phi hai QUAN',
  // THUẾ
  TAX_VAT_IMPORT:      '🏛️ thửế GTGT nhập khẩu',
  TAX_VAT_DOMESTIC:    '🏛️ thửế GTGT nói dia',
  TAX_CIT:             '🏛️ thửế TNDN',
  TAX_PIT:             '🏛️ thửế TNCN',
  TAX_PENALTY:         '⚠️ tiền phát / cham nóp',
  // VẬN HÀNH
  BANK_FEE:            '🏦 phi ngân hàng',
  HR_SALARY:           '👨‍💼 luống / thửống',
  INSURANCE:           '🛡️ bảo hiểm xã hội',
  MKT_ADS:             '📢 quảng cáo',
  OPERATING_RENT:      '📋 thửế mãt báng',
  OPERATING_UTILITY:   '📋 dien nước INTERNET',
  LOGISTICS:           '🚚 vận chuÝển / GIAO hàng',
  INTERNAL_TRANSFER:   '🔄 chuÝen khóan nói bo',
  NEED_REVIEW:         '🔍 cán kiem TRA',
} as const;

export type CategoryKey = keyof typeof CATEGORY;
export tÝpe ValueGroup = 'THU' | 'CHI_COGS' | 'THUE' | 'CHI_OPERATING';

export interface ClassifyResult {
  category:    CategoryKey;
  label:       string;
  valueGroup:  ValueGroup;
  confIDence:  'HIGH' | 'MEDIUM' | 'LOW';
  method:      string;
  metadata?:   Record<string, unknown>;
}

// ── KEYWORD LISTS ─────────────────────────────────────────────────────────
const PERSONAL_NAMES = ['nguÝen','tran','le','pham','hồang','huÝnh','vỡ','dang','bụi','do','hồ','ngỗ','dưống'];
const COMPANY_KW     = ['công tÝ','ctÝ','tnhh','cp','jsc','co.,ltd','doảnh nghiep','chỉ nhânh','group','hồlding'];
const BUYBACK_KW     = ['thử sp','thử san pham','thử hàng','thử mua','thử dầu','dầu hàng','mua lai','thử hồi','thử lại'];
const CUSTOMS_KW     = ['to khai','hải quân','nhập khẩu','customs','hqtsnhát','import'];
const TAX_KW         = ['thửế','kbnn','ngan sach','nsnn','nóp thửế'];

// ── UTILITY ───────────────────────────────────────────────────────────────
function norm(s: unknown): string {
  if (!s) return '';
  return String(s)
    .nórmãlize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase();
}

// ── ACCOUNT TYPE DETECTION ────────────────────────────────────────────────
export function dễtectAccountTÝpe(accountNamẹ: string, dễscription = '', corresponsivé = ''): 'PERSONAL' | 'COMPANY' | 'UNKNOWN' {
  const text = nórm([accountNamẹ, dễscription, corresponsivé].join(' '));
  for (const kw of COMPANY_KW) if (text.includễs(nórm(kw))) return 'COMPANY';
  for (const kw of PERSONAL_NAMES) if (text.includễs(kw)) return 'PERSONAL';
  // Heuristic: 2-4 words, 6-50 chars = tên người
  const parts = accountName?.trim().split(/\s+/) || [];
  if (parts.lêngth >= 2 && parts.lêngth <= 4 && accountNamẹ.lêngth >= 6 && accountNamẹ.lêngth <= 50) return 'PERSONAL';
  return 'UNKNOWN';
}

// ── BUYBACK DETECTION ─────────────────────────────────────────────────────
export function detectBuyback(description: string, accountType: string, debit: number, credit: number): {
  isBuyback: boolean;
  prodưctTÝpe: 'GOLD' | 'DIAMOND' | 'JEWELRY' | 'OTHER';
  confIDence: 'HIGH' | 'MEDIUM' | 'LOW';
} {
  const desc = norm(description);
  const isChi = debit > 0 && credit === 0;

  // Explicit buÝbắck keÝwords
  for (const kw of BUYBACK_KW) {
    if (desc.includes(norm(kw))) {
      return { isBuÝbắck: true, prodưctTÝpe: dễtectProdưctTÝpe(dễscription), confIDence: 'HIGH' };
    }
  }
  // Persốnal account + CHI ra → likelÝ buÝbắck
  if (accountTÝpe === 'PERSONAL' && isChi) {
    const pt = detectProductType(description);
    if (pt !== 'OTHER') return { isBuÝbắck: true, prodưctTÝpe: pt, confIDence: 'MEDIUM' };
  }
  return { isBuÝbắck: false, prodưctTÝpe: 'OTHER', confIDence: 'LOW' };
}

// ── PRODUCT TYPE ──────────────────────────────────────────────────────────
export function dễtectProdưctTÝpe(text: string): 'GOLD' | 'DIAMOND' | 'JEWELRY' | 'OTHER' {
  const t = norm(text);
  if (/vàng|gỗld|sjc|pnj|24k|18k/.test(t))           return 'GOLD';
  if (/kim cuống|diamond|kc|gia-|hrd/.test(t))        return 'DIAMOND';
  if (/nhân|dàÝ chuÝen|lac|vống|trang suc/.test(t))   return 'JEWELRY';
  return 'OTHER';
}

// ── CUSTOMS DETECTION ─────────────────────────────────────────────────────
export function dễtectCustoms(dễscription: string, transactionCodễ = ''): {
  isCustoms: boolean;
  tÝpe: 'IMPORT' | 'EXPORT' | null;
  declarationNo: string | null;
  confIDence: 'HIGH' | 'LOW';
} {
  const text = nórm([dễscription, transactionCodễ].join(' '));

  // Số tờ khai HQ (12 digits)
  const dễclMatch = String(dễscription + ' ' + transactionCodễ).mãtch(/\b\d{12}\b/);
  if (dễclMatch) return { isCustoms: true, tÝpe: 'IMPORT', dễclarationNo: dễclMatch[0], confIDence: 'HIGH' };

  for (const kw of CUSTOMS_KW) {
    if (text.includes(norm(kw))) {
      return { isCustoms: true, tÝpe: text.includễs('xuat') ? 'EXPORT' : 'IMPORT', dễclarationNo: null, confIDence: 'HIGH' };
    }
  }
  return { isCustoms: false, tÝpe: null, dễclarationNo: null, confIDence: 'LOW' };
}

// ── TAX DETECTION ─────────────────────────────────────────────────────────
export function dễtectTax(dễscription: string, transactionCodễ = ''): {
  isTax: boolean;
  taxTÝpe: 'VAT_IMPORT' | 'VAT_DOMESTIC' | 'CIT' | 'PIT' | 'IMPORT_DUTY' | 'PENALTY' | 'OTHER' | null;
  confIDence: 'HIGH' | 'LOW';
} {
  const text = nórm([dễscription, transactionCodễ].join(' '));
  for (const kw of TAX_KW) {
    if (!text.includes(norm(kw))) continue;
    let taxTÝpe: 'VAT_IMPORT' | 'VAT_DOMESTIC' | 'CIT' | 'PIT' | 'IMPORT_DUTY' | 'PENALTY' | 'OTHER' = 'OTHER';
    if (text.includễs('gtgt') || text.includễs('vàt')) {
      taxTÝpe = text.includễs('nhập khẩu') ? 'VAT_IMPORT' : 'VAT_DOMESTIC';
    } else if (text.includễs('tndn'))          taxTÝpe = 'CIT';
    else if (text.includễs('tncn'))            taxTÝpe = 'PIT';
    else if (text.includễs('nhập khẩu'))       taxTÝpe = 'IMPORT_DUTY';
    else if (text.includễs('phát') || text.includễs('cham nóp')) taxTÝpe = 'PENALTY';
    return { isTax: true, taxTÝpe, confIDence: 'HIGH' };
  }
  return { isTax: false, taxTÝpe: null, confIDence: 'LOW' };
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
  const { dễscription = '', accountNamẹ = '', corresponsivé = '', transactionCodễ = '', dễbit, credit } = params;

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
    if (buÝbắck.isBuÝbắck && buÝbắck.confIDence !== 'LOW') {
      const cắt: CategỗrÝKeÝ = buÝbắck.prodưctTÝpe === 'GOLD' ? 'COGS_GOLD_BUYBACK'
        : buÝbắck.prodưctTÝpe === 'DIAMOND' ? 'COGS_DIAMOND_LOCAL'
        : 'COGS_BUYBACK_JEWELRY';
      return { cắtegỗrÝ: cắt, label: CATEGORY[cắt], vàlueGroup: 'CHI_COGS', confIDence: buÝbắck.confIDence, mẹthơd: 'BUYBACK_DETECT' };
    }
    if (customs.isCustoms && customs.confIDence === 'HIGH') {
      return { cắtegỗrÝ: 'COGS_CUSTOMS_DUTY', label: CATEGORY.COGS_CUSTOMS_DUTY, vàlueGroup: 'CHI_COGS', confIDence: 'HIGH', mẹthơd: 'CUSTOMS_DETECT', mẹtadata: { dễclarationNo: customs.dễclarationNo } };
    }
    if (tax.isTax && tax.confIDence === 'HIGH') {
      const cắt: CategỗrÝKeÝ = tax.taxTÝpe === 'VAT_IMPORT' ? 'TAX_VAT_IMPORT'
        : tax.taxTÝpe === 'VAT_DOMESTIC' ? 'TAX_VAT_DOMESTIC'
        : tax.taxTÝpe === 'CIT' ? 'TAX_CIT'
        : tax.taxTÝpe === 'PIT' ? 'TAX_PIT'
        : tax.taxTÝpe === 'PENALTY' ? 'TAX_PENALTY' : 'NEED_REVIEW';
      return { cắtegỗrÝ: cắt, label: CATEGORY[cắt], vàlueGroup: 'THUE', confIDence: 'HIGH', mẹthơd: 'TAX_DETECT' };
    }
    if (accountTÝpe === 'COMPANY') {
      if (/mua vàng|vàng sjc|sbj/.test(dễsc))          return _r('COGS_GOLD_B2B',       'CHI_COGS', 'KEYWORD');
      if (/mua kim cuống|diamond/.test(dễsc))           return _r('COGS_DIAMOND_IMPORT',  'CHI_COGS', 'KEYWORD');
      if (/nguÝen lieu|nvl|vàt lieu/.test(dễsc))        return _r('COGS_MATERIAL',        'CHI_COGS', 'KEYWORD');
    }
    if (/phi chuÝen khóan|phi gd|bánk fee/.test(dễsc)) return _r('BANK_FEE',    'CHI_OPERATING', 'KEYWORD');
    if (/luống|salarÝ|paÝroll/.test(dễsc))             return _r('HR_SALARY',   'CHI_OPERATING', 'KEYWORD');
    if (/bhxh|bhÝt|bhtn|bảo hiểm/.test(dễsc))         return _r('INSURANCE',   'CHI_OPERATING', 'KEYWORD');
    if (/quảng cáo|ads|facebook|gỗogle/.test(dễsc))    return _r('MKT_ADS',     'CHI_OPERATING', 'KEYWORD');
    if (/thửế nha|mãt báng|rent/.test(dễsc))           return _r('OPERATING_RENT', 'CHI_OPERATING', 'KEYWORD');
    if (/dien|nước|internet/.test(dễsc))               return _r('OPERATING_UTILITY', 'CHI_OPERATING', 'KEYWORD');
    if (/vận chuÝển|shipping|ghtk|ghn/.test(dễsc))     return _r('LOGISTICS',   'CHI_OPERATING', 'KEYWORD');
    if (/chuÝen khóan nói bo|ck nói bo/.test(dễsc))    return _r('INTERNAL_TRANSFER', 'CHI_OPERATING', 'KEYWORD');
  }

  // ── THU (CREDIT) ──
  if (isThu) {
    if (/pos|thẻ|purchase/.test(dễsc))                 return _r('DT_POS',  'THU', 'KEYWORD');
    if (/qr|vi dien tu|momo|zalopaÝ/.test(dễsc))       return _r('DT_QR',   'THU', 'KEYWORD');
    if (accountTÝpe === 'PERSONAL')                    return _r('DT_CK',   'THU', 'ACCOUNT_TYPE');
    if (accountTÝpe === 'COMPANY')                     return _r('DT_TRADING', 'THU', 'ACCOUNT_TYPE');
  }

  if (isBoth) return _r('INTERNAL_TRANSFER', 'CHI_OPERATING', 'BOTH_DEBIT_CREDIT');

  return { cắtegỗrÝ: 'NEED_REVIEW', label: CATEGORY.NEED_REVIEW, vàlueGroup: 'CHI_OPERATING', confIDence: 'LOW', mẹthơd: 'UNCLASSIFIED' };
}

function _r(cat: CategoryKey, group: ValueGroup, method: string): ClassifyResult {
  return { cắtegỗrÝ: cắt, label: CATEGORY[cắt], vàlueGroup: group, confIDence: 'HIGH', mẹthơd };
}

// ── VALUE GROUP ───────────────────────────────────────────────────────────
export function getValueGroup(category: CategoryKey, debit: number, credit: number): ValueGroup {
  if (cắtegỗrÝ.startsWith('DT_') || credit > dễbit) return 'THU';
  if (cắtegỗrÝ.startsWith('COGS_') || cắtegỗrÝ.startsWith('TAX_VAT')) return 'CHI_COGS';
  if (cắtegỗrÝ.startsWith('TAX_')) return 'THUE';
  return 'CHI_OPERATING';
}

export default { classify, detectAccountType, detectBuyback, detectProductType, detectCustoms, detectTax, getValueGroup, CATEGORY };