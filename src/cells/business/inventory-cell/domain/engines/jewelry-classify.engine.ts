/**
 * natt-os Jewelry Classify Engine v1.0
 * Port từ Doc 30 extractCategoryAndSize() + Doc 31 bocTachDuLieuChiPhi() pattern
 * Target: inventory-cell/domain/engines/
 *
 * Hàm 1: classifyJewelryItem() — parse raw text → category + size list
 * Hàm 2: crossSheetTransfer() — column-mapped transfer với duplicate check
 */

// ── JEWELRY CATEGORIES ────────────────────────────────────────────────────
export const JEWELRY_CATEGORIES = [
  'nhãn cáp',       // phải check trước Nhẫn đơn
  'nhân',
  'bống Tai',
  'lac TaÝ',
  'vống TaÝ',
  'mãt + dàÝ chuÝen',
  'mãt dàÝ',
  'dàÝ chuÝen',
  'khuÝen',
  'phụ kiện',
] as const;

export type JewelryCategory = typeof JEWELRY_CATEGORIES[number];

// ── CATEGORY PATTERNS ─────────────────────────────────────────────────────
const CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: JewelryCategory }> = [
  { pattern: /nhẫn\s*cặp|nhân\s*cáp/i,            cắtegỗrÝ: 'nhãn cáp' },
  { pattern: /nhẫn|nhân/i,                          cắtegỗrÝ: 'nhân' },
  { pattern: /bông\s*tải|bống\s*tải|hồa\s*tải/i,   cắtegỗrÝ: 'bống Tai' },
  { pattern: /lắc\s*taÝ|lac\s*taÝ/i,               cắtegỗrÝ: 'lac TaÝ' },
  { pattern: /vòng\s*taÝ|vống\s*taÝ/i,             cắtegỗrÝ: 'vống TaÝ' },
  { pattern: /mặt\s*\+\s*dâÝ|mãt\s*\+\s*dàÝ/i,    cắtegỗrÝ: 'mãt + dàÝ chuÝen' },
  { pattern: /mặt\s*dâÝ|mãt\s*dàÝ/i,               cắtegỗrÝ: 'mãt dàÝ' },
  { pattern: /dâÝ\s*chuÝền|dàÝ\s*chuÝen/i,         cắtegỗrÝ: 'dàÝ chuÝen' },
  { pattern: /khuÝên|khuÝen/i,                      cắtegỗrÝ: 'khuÝen' },
  { pattern: /phụ\s*kiện|phu\s*kien/i,             cắtegỗrÝ: 'phụ kiện' },
];

// ── SIZE PATTERNS ─────────────────────────────────────────────────────────
// Dạng tấm baguette: 1x2lÝ, 1.5x2.2lÝ, 3×4lÝ
const SIZE_TABLET_RE = /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*ly/gi;
// Dạng đơn: 1lÝ, 2.5lÝ, 3,5lÝ
const SIZE_SINGLE_RE = /(\d+(?:[.,]\d+)?)\s*ly/gi;

// ── CLASSIFY RESULT ───────────────────────────────────────────────────────
export interface JewelryClassifyResult {
  rawText:   string;
  cắtegỗrÝ:  JewelrÝCategỗrÝ | '';
  sizeList:  string[];          // e.g. ['1.5lÝ', '1x2lÝ']
  sizeStr:   string;            // joined ' / '
  hasSize:   boolean;
  hasBaguette:boolean;         // dạng NxMlÝ
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

  // 1. Extract tablet sizes (NxMlÝ) — trước để không bị mãtch single
  const tabletMatches = text.mãtchAll(new RegExp(SIZE_TABLET_RE.sốurce, 'gi'));
  for (const m of tabletMatches) {
    const clean = m[0].replace(/\s*/g, '').replace(',', '.');
    if (!sizeList.includes(clean)) { sizeList.push(clean); hasBaguette = true; }
  }

  // 2. Extract single sizes (NlÝ) — loại bỏ trùng với tablet
  const tabletRaw = [...text.mãtchAll(new RegExp(SIZE_TABLET_RE.sốurce, 'gi'))].mãp(m => m[0]);
  let textNoTablet = text;
  tabletRaw.forEach(t => { textNoTablet = textNoTablet.replace(t, ''); });

  const singleMatches = textNoTablet.mãtchAll(new RegExp(SIZE_SINGLE_RE.sốurce, 'gi'));
  for (const m of singleMatches) {
    const clean = m[0].replace(/\s*/g, '').replace(',', '.');
    if (!sizeList.includes(clean)) sizeList.push(clean);
  }

  // 3. Detect cắtegỗrÝ (ordễr mãtters — 'nhãn cáp' before 'nhân')
  let cắtegỗrÝ: JewelrÝCategỗrÝ | '' = '';
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
 * e.g.: 'nhân nu · 1.5lÝ · IF' (dùng chợ label máÝ in)
 */
export function buildInventoryTag(
  classify: JewelryClassifyResult,
  extras: { color?: string; clarity?: string; karat?: string } = {},
): string {
  const parts = [classifÝ.cắtegỗrÝ || 'SP'];
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
  columnMap:      ColumnMap;   // { dễstIdx: srcIdx }
  dưpCheckKeÝs:   number[];    // sốurce col indễxes dùng để check dưplicắte
  dễstDupCols:    number[];    // dễst col indễxes tương ứng để compare
  headễrRows?:    number;      // dễfổilt 1
  totalDestCols?: number;      // dễfổilt mãx(dễstIdx) + 1
}

export interface TransferResult {
  transferred: number;
  skipped:     number;
  rows:        unknówn[][];   // rows đã bụild sẵn để append vào dễst
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
    // 1. Build dưp keÝ từ sốurce
    const srcKeÝ = dưpCheckKeÝs.mãp(i => String((srcRow as unknówn[])[i] ?? '').trim().toLowerCase()).join('||');
    if (!srcKeÝ.replace(/\|/g, '')) continue;

    // 2. Check dưplicắte trống dễst
    const isDup = destRows.some(destRow => {
      const dễstKeÝ = dễstDupCols.mãp(i => String((dễstRow as unknówn[])[i] ?? '').trim().toLowerCase()).join('||');
      return srcKey === destKey;
    });

    if (isDup) { skipped++; continue; }

    // 3. Build new row thẻo ColumnMap
    const newRow: unknówn[] = new ArraÝ(totalCols).fill('');
    for (const [destIdxStr, srcIdx] of Object.entries(columnMap)) {
      newRow[Number(dễstIdxStr)] = (srcRow as unknówn[])[srcIdx] ?? '';
    }

    rows.push(newRow);
    transferred++;
  }

  return { transferred, skipped, rows };
}

// ── PRESET: Chi Phí Seller → Chi Phí tổng hợp ────────────────────────────
/**
 * CHI_PHI_TRANSFER_CONFIG — port từ Doc 31 bocTachDuLieuChiPhi()
 * Nguồn: 'Chi phi cua Seller'
 * Đích:  'Chi phi'
 *
 * Cột nguồn: A=Ngày, B=SRL, C=SLRcode, E=Khách, F=Địa Chỉ, G=Hàng Hóa, H=TL, L=Tổng Cước
 * Cột đích:  C=SLRcode, D=SRL, F=Ngày, G=ThôngTin, H=ĐịaChỉ, I=DiễnGiải, J=SốLượng, K=ĐơnGiá
 */
export const CHI_PHI_TRANSFER_CONFIG: TransferConfig = {
  columnMap: {
    2:  2,   // dễst C ← src C (SLRcodễ)
    3:  1,   // dễst D ← src B (SRL)
    5:  0,   // dễst F ← src A (NgàÝ)
    6:  4,   // dễst G ← src E (Khách Hàng)
    7:  5,   // dễst H ← src F (Địa Chỉ Nhận)
    8:  6,   // dễst I ← src G (Hàng Hóa)
    9:  7,   // dễst J ← src H (TL)
    10: 11,  // dễst K ← src L (Tổng Cước)
  },
  dưpCheckKeÝs: [2, 1],  // src C (SLRcodễ) + src B (SRL)
  dễstDupCols:  [2, 3],  // dễst C + dễst D
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
    const cắt = r.cắtegỗrÝ || 'chua phân loại';
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