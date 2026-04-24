/**
 * Natt-OS Jewelry Classify Engine v1.0
 * Port từ Doc 30 extractCategoryAndSize() + Doc 31 bocTachDuLieuChiPhi() pattern
 * Target: inventory-cell/domain/engines/
 *
 * Hàm 1: classifyJewelryItem() — parse raw text → category + size list
 * Hàm 2: crossSheetTransfer() — column-mapped transfer với duplicate check
 */

// ── JEWELRY CATEGORIES ────────────────────────────────────────────────────
export const JEWELRY_CATEGORIES = [
  'Nhẫn Cặp',       // phải check trước Nhẫn đơn
  'Nhẫn',
  'Bông Tai',
  'Lắc Tay',
  'Vòng Tay',
  'Mặt + Dây Chuyền',
  'Mặt Dây',
  'Dây Chuyền',
  'Khuyên',
  'Phụ Kiện',
] as const;

export type JewelryCategory = typeof JEWELRY_CATEGORIES[number];

// ── CATEGORY PATTERNS ─────────────────────────────────────────────────────
const CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: JewelryCategory }> = [
  { pattern: /nhẫn\s*cặp|nhan\s*cap/i,            category: 'Nhẫn Cặp' },
  { pattern: /nhẫn|nhan/i,                          category: 'Nhẫn' },
  { pattern: /bông\s*tai|bong\s*tai|hoa\s*tai/i,   category: 'Bông Tai' },
  { pattern: /lắc\s*tay|lac\s*tay/i,               category: 'Lắc Tay' },
  { pattern: /vòng\s*tay|vong\s*tay/i,             category: 'Vòng Tay' },
  { pattern: /mặt\s*\+\s*dây|mat\s*\+\s*day/i,    category: 'Mặt + Dây Chuyền' },
  { pattern: /mặt\s*dây|mat\s*day/i,               category: 'Mặt Dây' },
  { pattern: /dây\s*chuyền|day\s*chuyen/i,         category: 'Dây Chuyền' },
  { pattern: /khuyên|khuyen/i,                      category: 'Khuyên' },
  { pattern: /phụ\s*kiện|phu\s*kien/i,             category: 'Phụ Kiện' },
];

// ── SIZE PATTERNS ─────────────────────────────────────────────────────────
// Dạng tấm baguette: 1x2ly, 1.5x2.2ly, 3×4ly
const SIZE_TABLET_RE = /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*ly/gi;
// Dạng đơn: 1ly, 2.5ly, 3,5ly
const SIZE_SINGLE_RE = /(\d+(?:[.,]\d+)?)\s*ly/gi;

// ── CLASSIFY RESULT ───────────────────────────────────────────────────────
export interface JewelryClassifyResult {
  rawText:   string;
  category:  JewelryCategory | '';
  sizeList:  string[];          // e.g. ['1.5ly', '1x2ly']
  sizeStr:   string;            // joined ' / '
  hasSize:   boolean;
  hasBaguette:boolean;         // dạng NxMly
}

// ── MAIN CLASSIFY ─────────────────────────────────────────────────────────
/**
 * classifyJewelryItem — port từ Doc 30 extractCategoryAndSize()
 * Parse raw description → category + size list (đơn + tấm baguette)
 */
export function classifyJewelryItem(rawText: string): JewelryClassifyResult {
  const text = (rawText ?? '').toLowerCase();
  const sizeList: string[] = [];
  let hasBaguette = false;

  // 1. Extract tablet sizes (NxMly) — trước để không bị match single
  const tabletMatches = text.matchAll(new RegExp(SIZE_TABLET_RE.source, 'gi'));
  for (const m of tabletMatches) {
    const clean = m[0].replace(/\s*/g, '').replace(',', '.');
    if (!sizeList.includes(clean)) { sizeList.push(clean); hasBaguette = true; }
  }

  // 2. Extract single sizes (Nly) — loại bỏ trùng với tablet
  const tabletRaw = [...text.matchAll(new RegExp(SIZE_TABLET_RE.source, 'gi'))].map(m => m[0]);
  let textNoTablet = text;
  tabletRaw.forEach(t => { textNoTablet = textNoTablet.replace(t, ''); });

  const singleMatches = textNoTablet.matchAll(new RegExp(SIZE_SINGLE_RE.source, 'gi'));
  for (const m of singleMatches) {
    const clean = m[0].replace(/\s*/g, '').replace(',', '.');
    if (!sizeList.includes(clean)) sizeList.push(clean);
  }

  // 3. Detect category (order matters — 'Nhẫn Cặp' before 'Nhẫn')
  let category: JewelryCategory | '' = '';
  for (const { pattern, category: cat } of CATEGORY_PATTERNS) {
    if (pattern.test(text)) { category = cat; break; }
  }

  return {
    rawText:    rawText,
    category,
    sizeList,
    sizeStr:    sizeList.join(' / '),
    hasSize:    sizeList.length > 0,
    hasBaguette,
  };
}

/**
 * classifyBatch — classify nhiều items, trả array kết quả
 */
export function classifyBatch(items: string[]): JewelryClassifyResult[] {
  return items.map(classifyJewelryItem);
}

/**
 * buildInventoryTag — tạo tag ngắn cho inventory từ classification
 * e.g.: 'Nhẫn Nữ · 1.5ly · IF' (dùng cho label máy in)
 */
export function buildInventoryTag(
  classify: JewelryClassifyResult,
  extras: { color?: string; clarity?: string; karat?: string } = {},
): string {
  const parts = [classify.category || 'SP'];
  if (classify.sizeStr) parts.push(classify.sizeStr);
  if (extras.karat)   parts.push(extras.karat);
  if (extras.color)   parts.push(extras.color);
  if (extras.clarity) parts.push(extras.clarity);
  return parts.join(' · ');
}

// ── CROSS SHEET TRANSFER ─────────────────────────────────────────────────
/**
 * ColumnMap — port từ Doc 31 bocTachDuLieuChiPhi() columnMap pattern
 * Key = dest column index (0-based)
 * Value = source column index (0-based)
 */
export type ColumnMap = Record<number, number>;

export interface TransferConfig {
  columnMap:      ColumnMap;   // { destIdx: srcIdx }
  dupCheckKeys:   number[];    // source col indexes dùng để check duplicate
  destDupCols:    number[];    // dest col indexes tương ứng để compare
  headerRows?:    number;      // default 1
  totalDestCols?: number;      // default max(destIdx) + 1
}

export interface TransferResult {
  transferred: number;
  skipped:     number;
  rows:        unknown[][];   // rows đã build sẵn để append vào dest
}

/**
 * buildTransferRows — port từ Doc 31 bocTachDuLieuChiPhi()
 * So sánh src vs dest theo dupCheckKeys, chỉ giữ rows CHƯA có trong dest
 * Build output rows theo ColumnMap
 *
 * @param srcRows  - data từ source sheet (không tính header)
 * @param destRows - data từ dest sheet (không tính header)
 * @param config   - TransferConfig
 */
export function buildTransferRows(
  srcRows:  unknown[][],
  destRows: unknown[][],
  config:   TransferConfig,
): TransferResult {
  const { columnMap, dupCheckKeys, destDupCols } = config;
  const totalCols = config.totalDestCols
    ?? Math.max(...Object.keys(columnMap).map(Number)) + 1;

  let transferred = 0;
  let skipped     = 0;
  const rows: unknown[][] = [];

  for (const srcRow of srcRows) {
    // 1. Build dup key từ source
    const srcKey = dupCheckKeys.map(i => String((srcRow as unknown[])[i] ?? '').trim().toLowerCase()).join('||');
    if (!srcKey.replace(/\|/g, '')) continue;

    // 2. Check duplicate trong dest
    const isDup = destRows.some(destRow => {
      const destKey = destDupCols.map(i => String((destRow as unknown[])[i] ?? '').trim().toLowerCase()).join('||');
      return srcKey === destKey;
    });

    if (isDup) { skipped++; continue; }

    // 3. Build new row theo ColumnMap
    const newRow: unknown[] = new Array(totalCols).fill('');
    for (const [destIdxStr, srcIdx] of Object.entries(columnMap)) {
      newRow[Number(destIdxStr)] = (srcRow as unknown[])[srcIdx] ?? '';
    }

    rows.push(newRow);
    transferred++;
  }

  return { transferred, skipped, rows };
}

// ── PRESET: Chi Phí Seller → Chi Phí tổng hợp ────────────────────────────
/**
 * CHI_PHI_TRANSFER_CONFIG — port từ Doc 31 bocTachDuLieuChiPhi()
 * Nguồn: 'Chi Phí Của Seller'
 * Đích:  'Chi Phí'
 *
 * Cột nguồn: A=Ngày, B=SRL, C=SLRcode, E=Khách, F=Địa Chỉ, G=Hàng Hóa, H=TL, L=Tổng Cước
 * Cột đích:  C=SLRcode, D=SRL, F=Ngày, G=ThôngTin, H=ĐịaChỉ, I=DiễnGiải, J=SốLượng, K=ĐơnGiá
 */
export const CHI_PHI_TRANSFER_CONFIG: TransferConfig = {
  columnMap: {
    2:  2,   // dest C ← src C (SLRcode)
    3:  1,   // dest D ← src B (SRL)
    5:  0,   // dest F ← src A (Ngày)
    6:  4,   // dest G ← src E (Khách Hàng)
    7:  5,   // dest H ← src F (Địa Chỉ Nhận)
    8:  6,   // dest I ← src G (Hàng Hóa)
    9:  7,   // dest J ← src H (TL)
    10: 11,  // dest K ← src L (Tổng Cước)
  },
  dupCheckKeys: [2, 1],  // src C (SLRcode) + src B (SRL)
  destDupCols:  [2, 3],  // dest C + dest D
  headerRows:   1,
  totalDestCols:13,
};

// ── CATEGORY STATS ────────────────────────────────────────────────────────
export function buildCategoryStats(results: JewelryClassifyResult[]): {
  byCategory: Array<{ category: string; count: number }>;
  withSize:   number;
  withBaguette:number;
  unclassified:number;
} {
  const catMap: Record<string, number> = {};
  let withSize = 0, withBaguette = 0, unclassified = 0;

  results.forEach(r => {
    const cat = r.category || 'Chưa phân loại';
    catMap[cat] = (catMap[cat] ?? 0) + 1;
    if (r.hasSize)     withSize++;
    if (r.hasBaguette) withBaguette++;
    if (!r.category)   unclassified++;
  });

  return {
    byCategory:   Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([category, count]) => ({ category, count })),
    withSize,
    withBaguette,
    unclassified,
  };
}

export default {
  JEWELRY_CATEGORIES, CATEGORY_PATTERNS, CHI_PHI_TRANSFER_CONFIG,
  classifyJewelryItem, classifyBatch, buildInventoryTag,
  buildTransferRows, buildCategoryStats,
};
