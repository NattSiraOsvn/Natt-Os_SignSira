// @ts-nocheck
/**
 * finance-cell/domain/engines/smart-classify.engine.ts
 * Wave 1 — phân loại sao kê ngân hàng thông minh
 * Wave 4 — thêm accountByKeywords (TK kế toán TT200 tự động)
 *
 * Nguồn Wave 1 : MEGA ACCOUNTING v10.2 SmartClassifier
 * Nguồn Wave 4 : TAXCELL ULTIMATE V6.0 Normalize.accountByKeywords
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
  | 'MUAT_HANG'         // mua hàng hóa, nguyên liệu
  | 'BAN_HANG'          // doanh thu bán hàng
  | 'LUONG'             // lương, BHXH, TNCN
  | 'CHI_PHI_BAN_HANG'  // quảng cáo, vận chuyển, ship
  | 'CHI_PHI_QLHD'      // điện nước, internet, phân kim, văn phòng
  | 'TSCĐ'              // tài sản cố định ≥ 30tr
  | 'CCDC'              // công cụ dụng cụ < 30tr
  | 'COC_KHACH'         // đặt cọc khách hàng
  | 'HOAN_COC'          // hoàn cọc
  | 'BUYBACK'           // mua lại hàng
  | 'CUSTOMS'           // thuế nhập khẩu, tờ khai HQ
  | 'TAX'               // VAT, TNCN, môn bài
  | 'UNKNOWN';

export interface ClassifyResult {
  category: Category;
  tkNo: string;   // TK Nợ TT200
  tkCo: string;   // TK Có TT200
  confidence: number; // 0–1
  note: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TK CONSTANTS (TT200 — dùng chung toàn finance-cell)
// ─────────────────────────────────────────────────────────────────────────────

export const TK = {
  CASH:           '111',
  BANK:           '112',
  RECEIVABLE:     '131',
  PAYABLE:        '331',
  SALARY_PAYABLE: '334',
  INSURANCE:      '338',
  LOAN:           '341',
  ADVANCE:        '141',
  INV_MAT:        '152',  // nguyên vật liệu
  INV_CCDC:       '153',  // công cụ dụng cụ
  INV_WIP:        '154',  // sản xuất dở dang
  INV_FIN:        '155',  // thành phẩm
  INV_GOODS:      '156',  // hàng hóa
  COGS:           '632',
  FIXED_ASSET:    '211',
  INTANGIBLE:     '213',
  DEPRECIATION:   '214',
  CIP:            '241',
  PREPAID_LONG:   '242',
  REVENUE:        '511',
  SELLING_EXP:    '641',
  ADMIN_EXP:      '642',
  PROD_SALARY:    '622',
  PROD_OVERHEAD:  '627',
  VAT:            '3331',
  DEPOSIT:        '3387',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// WAVE 1 — CATEGORY MAP (60 categories, nguồn MEGA ACCOUNTING sync-engine)
// ─────────────────────────────────────────────────────────────────────────────

export const FULL_CATEGORY_MAP: Record<string, Category> = {
  // Mua hàng
  'mua hang': 'MUAT_HANG', 'nhap hang': 'MUAT_HANG', 'thanh toan ncc': 'MUAT_HANG',
  'vat tu': 'MUAT_HANG', 'nguyen lieu': 'MUAT_HANG', 'nguyen vat lieu': 'MUAT_HANG',
  'kim cuong': 'MUAT_HANG', 'vien chu': 'MUAT_HANG', 'da quy': 'MUAT_HANG',
  'vang': 'MUAT_HANG', 'bac': 'MUAT_HANG', 'kim loai': 'MUAT_HANG',
  // Doanh thu
  'ban hang': 'BAN_HANG', 'doanh thu': 'BAN_HANG', 'thu tien': 'BAN_HANG',
  'thanh toan don': 'BAN_HANG', 'khach chuyen': 'BAN_HANG', 'khach tra': 'BAN_HANG',
  // Lương
  'luong': 'LUONG', 'thu nhap': 'LUONG', 'bhxh': 'LUONG', 'bao hiem': 'LUONG',
  'tncn': 'TAX', 'bao hiem xa hoi': 'LUONG', 'thu lao': 'LUONG',
  // Chi phí bán hàng
  'quang cao': 'CHI_PHI_BAN_HANG', 'ads': 'CHI_PHI_BAN_HANG',
  'meta': 'CHI_PHI_BAN_HANG', 'google ads': 'CHI_PHI_BAN_HANG',
  'shopee': 'CHI_PHI_BAN_HANG', 'van chuyen': 'CHI_PHI_BAN_HANG',
  'ship': 'CHI_PHI_BAN_HANG', 'ghn': 'CHI_PHI_BAN_HANG', 'ghtk': 'CHI_PHI_BAN_HANG',
  // Chi phí QLHD
  'dien': 'CHI_PHI_QLHD', 'nuoc': 'CHI_PHI_QLHD', 'internet': 'CHI_PHI_QLHD',
  've sinh': 'CHI_PHI_QLHD', 'bao ve': 'CHI_PHI_QLHD', 'phan kim': 'CHI_PHI_QLHD',
  'kiem dinh': 'CHI_PHI_QLHD', 'phong thuy': 'CHI_PHI_QLHD', 'cung': 'CHI_PHI_QLHD',
  // Cọc
  'dat coc': 'COC_KHACH', 'coc': 'COC_KHACH', 'tien coc': 'COC_KHACH',
  'hoan coc': 'HOAN_COC', 'tra coc': 'HOAN_COC', 'hoan tra': 'HOAN_COC',
  // Buyback
  'mua lai': 'BUYBACK', 'thu lai': 'BUYBACK', 'buyback': 'BUYBACK',
  // Customs / thuế
  'thue nhap khau': 'CUSTOMS', 'to khai': 'CUSTOMS', 'hai quan': 'CUSTOMS',
  'vat': 'TAX', 'gia tri gia tang': 'TAX', 'mon bai': 'TAX',
  // TSCĐ / CCDC
  'may moc': 'TSCĐ', 'lo duc': 'TSCĐ', 'imac': 'TSCĐ', 'may tinh': 'TSCĐ',
  'phan mem': 'TSCĐ', 'ban ghe': 'CCDC', 'noi that': 'CCDC',
  'cong cu': 'CCDC', 'dung cu': 'CCDC',
};

// ─────────────────────────────────────────────────────────────────────────────
// WAVE 1 — CORE CLASSIFY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chuẩn hóa text: lowercase → NFD → bỏ combining marks → đ→d
 */
function norm(s: string): string {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd');
}

/**
 * classify — entry point chính.
 * Input: description text từ sao kê ngân hàng hoặc chứng từ.
 * Output: ClassifyResult với category, TK Nợ/Có, confidence.
 */
export function classify(description: string, amount = 0): ClassifyResult {
  const n = norm(description);

  // Kiểm tra buyback trước (ưu tiên cao — tránh nhầm với ban_hang)
  if (detectBuyback(n)) {
    return { category: 'BUYBACK', tkNo: TK.INV_GOODS, tkCo: TK.BANK, confidence: 0.85, note: 'Buyback detected' };
  }

  // Kiểm tra customs
  if (detectCustoms(n)) {
    return { category: 'CUSTOMS', tkNo: TK.INV_MAT, tkCo: TK.BANK, confidence: 0.88, note: 'Customs/import tax' };
  }

  // Kiểm tra tax
  if (detectTax(n)) {
    return { category: 'TAX', tkNo: TK.VAT, tkCo: TK.BANK, confidence: 0.85, note: 'Tax payment' };
  }

  // Duyệt full category map
  for (const [keyword, cat] of Object.entries(FULL_CATEGORY_MAP)) {
    if (n.includes(keyword)) {
      const { tkNo, tkCo } = resolveTK(cat, amount);
      return { category: cat, tkNo, tkCo, confidence: 0.75, note: `Matched: ${keyword}` };
    }
  }

  return { category: 'UNKNOWN', tkNo: TK.ADMIN_EXP, tkCo: TK.BANK, confidence: 0.2, note: 'No match' };
}

export function detectAccountType(description: string): string {
  const n = norm(description);
  if (n.includes('ngan hang') || n.includes('bank') || n.includes('vcb') || n.includes('tcb') || n.includes('acb')) return 'BANK';
  if (n.includes('tien mat') || n.includes('cash') || n.includes('thu quy')) return 'CASH';
  return 'UNKNOWN';
}

export function detectBuyback(description: string): boolean {
  const n = norm(description);
  return /mua lai|thu lai|buyback|hoan tra hang|doi hang/.test(n);
}

export function detectCustoms(description: string): boolean {
  const n = norm(description);
  return /hai quan|to khai|thue nhap khau|cif|import tax|customs/.test(n);
}

export function detectTax(description: string): boolean {
  const n = norm(description);
  return /\bvat\b|gia tri gia tang|thue gtgt|mon bai|tndn|thue thu nhap/.test(n);
}

function resolveTK(cat: Category, amount: number): { tkNo: string; tkCo: string } {
  switch (cat) {
    case 'MUAT_HANG':        return { tkNo: TK.INV_MAT,        tkCo: TK.PAYABLE };
    case 'BAN_HANG':         return { tkNo: TK.DEPOSIT,         tkCo: TK.REVENUE };
    case 'LUONG':            return { tkNo: TK.SALARY_PAYABLE,  tkCo: TK.BANK };
    case 'CHI_PHI_BAN_HANG': return { tkNo: TK.SELLING_EXP,    tkCo: TK.BANK };
    case 'CHI_PHI_QLHD':     return { tkNo: TK.ADMIN_EXP,      tkCo: TK.BANK };
    case 'TSCĐ':             return { tkNo: TK.FIXED_ASSET,     tkCo: TK.PAYABLE };
    case 'CCDC':             return { tkNo: TK.INV_CCDC,        tkCo: TK.BANK };
    case 'COC_KHACH':        return { tkNo: TK.BANK,            tkCo: TK.DEPOSIT };
    case 'HOAN_COC':         return { tkNo: TK.DEPOSIT,         tkCo: TK.BANK };
    case 'BUYBACK':          return { tkNo: TK.INV_GOODS,       tkCo: TK.BANK };
    case 'CUSTOMS':          return { tkNo: TK.INV_MAT,         tkCo: TK.BANK };
    case 'TAX':              return { tkNo: TK.VAT,             tkCo: TK.BANK };
    default:                 return { tkNo: TK.ADMIN_EXP,       tkCo: TK.BANK };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WAVE 4 — accountByKeywords (nguồn: TAXCELL ULTIMATE V6.0)
//
// Phân loại TK Nợ tự động dựa trên description + amount threshold.
// Rule amount ≥ 30tr → TSCĐ (211/213), < 30tr → CCDC (153).
// Ưu tiên: keyword cụ thể → amount threshold → fallback ADMIN_EXP.
//
// QUAN TRỌNG (Tax-cell rule TR-007):
// Kết quả hàm này là GỢI Ý — không override manual entry của kế toán.
// ─────────────────────────────────────────────────────────────────────────────

const TSCĐ_THRESHOLD = 30_000_000;

/**
 * accountByKeywords — auto map description + amount → TK Nợ TT200.
 * Trả về TK string (vd "211", "641").
 * Không throw, fallback về '642' (ADMIN_EXP).
 */
export function accountByKeywords(description: string, amount = 0): string {
  const n = norm(description);

  // ── Sổ 3: TSCĐ & CCDC ──────────────────────────────────────────────────
  if (amount >= TSCĐ_THRESHOLD) {
    if (/may|lo duc|imac|\bpc\b|server|may tinh|thiet bi/.test(n)) return TK.FIXED_ASSET;    // 211
    if (/phan mem|ban quyen|license|intangible/.test(n))            return TK.INTANGIBLE;     // 213
  }
  // Nội thất: ≥30tr → 211, <30tr → 153
  if (/ban\b|ghe\b|\btu\b|ke\b|noi that/.test(n)) {
    return amount >= TSCĐ_THRESHOLD ? TK.FIXED_ASSET : TK.INV_CCDC;
  }
  if (/cong cu|dung cu|may cat|may mai/.test(n))                    return TK.INV_CCDC;       // 153

  // ── Sổ 2: Nguyên liệu, hàng hóa ────────────────────────────────────────
  if (/vien chu|gia\b|kim cuong.*kem dai|kim cuong.*vien/.test(n))  return TK.INV_MAT;        // 152 viên chủ
  if (/day chuyen|moissanite|\bda\b|vang|bac.*hang/.test(n))        return TK.INV_GOODS;      // 156
  if (/bia kim cuong|hop\b|tui\b|zip|bao bi|dong goi/.test(n))      return TK.INV_MAT;        // 152 bao bì
  if (/phu gia|hoa chat|resin|gas|khi/.test(n))                     return TK.INV_MAT;        // 152 phụ liệu SX

  // ── Sổ 4: Chi phí ───────────────────────────────────────────────────────
  if (/ads|quang cao|meta|google|shopee|van chuyen|ship|ghn|ghtk/.test(n)) return TK.SELLING_EXP;  // 641
  if (/dien\b|nuoc\b|internet|ve sinh|bao ve|phan kim|kiem dinh|phong thuy|cung\b/.test(n))
                                                                     return TK.ADMIN_EXP;     // 642
  if (/luong|thuong\b/.test(n))                                      return TK.SALARY_PAYABLE; // 334

  // ── Fallback ─────────────────────────────────────────────────────────────
  return TK.ADMIN_EXP; // 642
}

/**
 * accountForVendor — TK Có mặc định khi mua từ nhà cung cấp.
 * Tách riêng để dễ override (vd NCC tiền mặt → 111 thay vì 331).
 */
export function accountForVendor(paymentMethod: 'bank' | 'cash' | 'credit' = 'credit'): string {
  if (paymentMethod === 'cash') return TK.CASH;
  if (paymentMethod === 'bank') return TK.BANK;
  return TK.PAYABLE; // 331 mặc định
}

// ─────────────────────────────────────────────────────────────────────────────
// WAVE 4 — getSheetDataWithHeaders (nguồn: File 16 HR GAS)
//
// Convert mảng 2D (Google Sheets getValues) → array of objects
// key = header name gốc (giữ nguyên, không normalize)
// Dùng khi cần access by column name thay vì index
// ─────────────────────────────────────────────────────────────────────────────

export interface SheetRow {
  [key: string]: unknown;
}

export function getSheetDataWithHeaders(
  rawValues: unknown[][],
): { headers: string[]; data: SheetRow[] } {
  if (!rawValues || rawValues.length < 2) return { headers: [], data: [] };
  const headers = rawValues[0].map(h => String(h || ''));
  const data: SheetRow[] = [];
  for (let i = 1; i < rawValues.length; i++) {
    const obj: SheetRow = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      if (headers[j]) {
        obj[headers[j]] = rawValues[i][j];
        if (rawValues[i][j] !== '' && rawValues[i][j] !== null && rawValues[i][j] !== undefined) {
          hasData = true;
        }
      }
    }
    if (hasData) data.push(obj);
  }
  return { headers, data };
}
