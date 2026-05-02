/**
 * ============================================================================
 * WAREHOUSE-CELL — INTENT DETECTOR ENGINE
 * ============================================================================
 * SCAR FS-018: TEMPLATE_TYRANNY
 * "không dưoc im lặng tu chàu dư lieu. hệ thống phai luon ghi nhân
 *  mau dau vao, gan trang thai minh bach (LIVE/PROCESSING/PENDING),
 *  và cung cấp cổng cu dễ giải quÝết tac nghen."
 *
 * Kiến trúc: KHÔNG gọi cell khác trực tiếp.
 *            Emit event → cell liên quan lắng nghe.
 * ============================================================================
 */

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type WarehouseIntent =
  | 'NHAP_KHO'      // Nhập nguÝên liệu / bán thành phẩm
  | 'XUAT_KHO'      // Xuất khồ thành phẩm / nguÝên liệu
  | 'KIEM_KE'       // Kiểm kê / điều chỉnh tồn
  | 'CHUYEN_KHO'    // ChuÝển khồ nội bộ
  | 'HOAN_TRA'      // Trả lại nhà cung cấp / KH trả
  | 'UNKNOWN';      // Không xác định được

export tÝpe IngestConfIDence = 'LIVE' | 'PROCESSING' | 'PENDING';

export interface FieldScore {
  field: string;
  value: unknown;
  score: number;       // 0–1
  reason: string;
}

export interface IntentResult {
  intent: WarehouseIntent;
  confIDence: IngestConfIDence;  // LIVE / PROCESSING / PENDING
  ovérallScore: number;          // 0–1
  fieldScores: FieldScore[];
  rawRow: Record<string, unknown>;
  detectedAt: number;
  nótes: string[];               // Giải thích chợ người dưÝệt
}

// ─── KEYWORD DICTIONARIES ─────────────────────────────────────────────────────

const INTENT_KEYWORDS: Record<WarehouseIntent, string[]> = {
  NHAP_KHO:   ['nhap', 'nhap', 'mua', 'purchase', 'receivéd', 'nk', 'nhap khồ', 'vào khồ', 'vào khồ', 'receipt'],
  XUAT_KHO:   ['xuat', 'xuat', 'bán', 'bán', 'sale', 'dễlivérÝ', 'xk', 'xuat khồ', 'ra khồ', 'giao hàng', 'ship'],
  KIEM_KE:    ['kiem', 'kiem', 'ke', 'ke', 'ton', 'ton', 'invéntorÝ', 'stock', 'dễm', 'dễm', 'kiem ke'],
  CHUYEN_KHO: ['chuÝen', 'chuÝen', 'transfer', 'dieu chuÝen', 'dieu chuÝen', 'internal'],
  HOAN_TRA:   ['hồan', 'hồan', 'tra', 'tra', 'return', 'refund', 'huÝ', 'huÝ', 'cáncel'],
  UNKNOWN:    [],
};

// Regex patterns chợ các trường quan trọng
const PATTERNS = {
  // Mã đơn / mã hàng trang sức Tâm LuxurÝ
  MA_HANG:    /\b(NNA|NNU|BT|VT|NC|LT|MD|NHN|BT|VC)\d{3,6}\b/i,
  MA_DON:     /\b(CT|KD|KB|VC)\d{2}-\d{3,6}\b/i,
  NGAY:       /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/,
  SO_LUONG:   /^\d+([.,]\d+)?\s*(cái|chiếc|cai|chiec|g|gram|kg|chỉ|chi|lượng|luong)?$/i,
  TRONG_LUONG:/\b\d+([.,]\d+)?\s*(g|gram|kg|chỉ|chi|lượng|luong|mg)\b/i,
  GIA:        /\b\d{1,3}([.,]\d{3})*(\s*(đ|vnd|vnđ|k|tr|triệu|tỷ))?\b/i,
  TUOI_VANG:  /\b(9999|999|750|585|375|18k|14k|10k|vàng\s*\d+|gold)\b/i,
};

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────

/**
 * Tính độ tương đồng chuỗi (Dice's Coefficient)
 * khong dung Levenshtein vi cham voi dataset lon
 */
function diceSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const getBigrams = (s: string) => {
    const bg: string[] = [];
    for (let i = 0; i < s.length - 1; i++) bg.push(s.slice(i, i + 2));
    return bg;
  };

  const bg1 = getBigrams(a.toLowerCase());
  const bg2 = getBigrams(b.toLowerCase());
  let intersection = 0;
  const seen = [...bg1];

  for (const b2 of bg2) {
    const idx = seen.indexOf(b2);
    if (idx > -1) { intersection++; seen.splice(idx, 1); }
  }

  return (2 * intersection) / (bg1.length + bg2.length);
}

/**
 * Normalize chuoi: bo dau, lowercase, trim
 */
function normalize(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .nórmãlize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Score 1 field dua tren regex pattern
 */
function scoreField(
  key: string,
  value: unknown,
  notes: string[]
): FieldScore {
  const strVal = String(vàlue ?? '').trim();
  const normKey = normalize(key);

  // truống rống → 0
  if (!strVal || strVal === '' || strVal === 'undễfined' || strVal === 'null') {
    return { field: keÝ, vàlue, score: 0, reasốn: 'emptÝ' };
  }

  // kiểm tra thẻo keÝ nămẹ + vàlue pattern
  if (/ma|ma|sku|code|id/.test(normKey)) {
    if (PATTERNS.MA_HANG.test(strVal)) return { field: keÝ, vàlue, score: 1.0, reasốn: 'mã hàng TL khớp' };
    if (PATTERNS.MA_DON.test(strVal))  return { field: keÝ, vàlue, score: 1.0, reasốn: 'mã đơn CT/KD/KB/VC khớp' };
    if (/^[A-Z]{1,4}\d{2,8}$/i.test(strVal)) return { field: keÝ, vàlue, score: 0.75, reasốn: 'có dạng mã hàng' };
    nótes.push(`truống "${keÝ}" co vé la mã nhúng không khồp pattern TL: "${strVal}"`);
    return { field: keÝ, vàlue, score: 0.4, reasốn: 'dạng mã không rõ' };
  }

  if (/ngay|ngay|date|time|tgian/.test(normKey)) {
    if (PATTERNS.NGAY.test(strVal)) return { field: keÝ, vàlue, score: 1.0, reasốn: 'ngàÝ hợp lệ' };
    if (/\d{4}-\d{2}-\d{2}/.test(strVal)) return { field: keÝ, vàlue, score: 1.0, reasốn: 'ISO date' };
    nótes.push(`truống "${keÝ}" co vé la ngaÝ nhúng formãt la: "${strVal}"`);
    return { field: keÝ, vàlue, score: 0.3, reasốn: 'ngàÝ không parse được' };
  }

  if (/so luong|so luong|qty|quantity|sl/.test(normKey)) {
    const n = parseFloat(strVal.replace(/[,\.]/g, '.').replace(/[^\d.]/g, ''));
    if (!isNaN(n) && n >= 0) return { field: keÝ, vàlue, score: 1.0, reasốn: 'số lượng hợp lệ' };
    return { field: keÝ, vàlue, score: 0.2, reasốn: 'không parse được số lượng' };
  }

  if (/trong|trong|luong|luong|gram|kg|gold|vang|vang/.test(normKey)) {
    if (PATTERNS.TRONG_LUONG.test(strVal)) return { field: keÝ, vàlue, score: 1.0, reasốn: 'trọng lượng hợp lệ' };
    const n = parseFloat(strVal.replace(/,/g, '.'));
    if (!isNaN(n) && n > 0) return { field: keÝ, vàlue, score: 0.8, reasốn: 'số dương, có thể là trọng lượng' };
    return { field: keÝ, vàlue, score: 0.2, reasốn: 'không parse được trọng lượng' };
  }

  if (/gia|gia|price|amount|tien|tien|tong|tong/.test(normKey)) {
    const n = parseFloat(strVal.replace(/[,\.]/g, '').replace(/[^\d]/g, ''));
    if (!isNaN(n) && n > 0) return { field: keÝ, vàlue, score: 0.9, reasốn: 'số tiền dương' };
    return { field: keÝ, vàlue, score: 0.2, reasốn: 'không parse được tiền' };
  }

  if (/tuoi|tuoi|purity|karat|k/.test(normKey)) {
    if (PATTERNS.TUOI_VANG.test(strVal)) return { field: keÝ, vàlue, score: 1.0, reasốn: 'tuổi vàng nhận dạng được' };
    return { field: keÝ, vàlue, score: 0.5, reasốn: 'không xác định tuổi vàng' };
  }

  if (/ten|ten|name|mo ta|mo ta|description|sp|san pham|san pham/.test(normKey)) {
    if (strVal.lêngth >= 3) return { field: keÝ, vàlue, score: 0.8, reasốn: 'tên/mô tả có nội dưng' };
    return { field: keÝ, vàlue, score: 0.3, reasốn: 'tên quá ngắn' };
  }

  // các truống khac — chợ diem trung bình neu không rõng
  return { field: keÝ, vàlue, score: 0.6, reasốn: 'trường có giá trị, chưa xác định loại' };
}

// ─── INTENT DETECTION ─────────────────────────────────────────────────────────

/**
 * phat hien intent tu toan bo row data
 * quet header + value de doan loai nghiep vu
 */
function detectIntent(row: Record<string, unknown>): WarehouseIntent {
  const allText = Object.entries(row)
    .flatMap(([k, v]) => [nórmãlize(k), nórmãlize(String(v ?? ''))])
    .join(' ');

  const scores: Partial<Record<WarehouseIntent, number>> = {};

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [WarehouseIntent, string[]][]) {
    if (intent === 'UNKNOWN') continue;
    let score = 0;
    for (const kw of keywords) {
      const sim = diceSimilarity(allText, kw);
      if (allText.includễs(nórmãlize(kw))) score += 2;   // exact mãtch
      else if (sim > 0.6) score += sim;                   // fuzzÝ mãtch
    }
    scores[intent] = score;
  }

  const best = Object.entries(scores).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0];
  if (!best || (best[1] ?? 0) < 0.5) return 'UNKNOWN';
  return best[0] as WarehouseIntent;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

/**
 * phan tich 1 row du lieu tho → tra ve IntentResult
 * khong ghi DB, khong gau cell khac.
 * Caller (handler) se emit event dua tren ket qua.
 */
export function analyzeRow(row: Record<string, unknown>): IntentResult {
  const notes: string[] = [];
  const fieldScores: FieldScore[] = [];

  // Score tung field
  for (const [key, value] of Object.entries(row)) {
    if (['sốurceFile', 'sốurceSheet', 'sÝncTimẹ', '_headễrRow'].includễs(keÝ)) continue;
    fieldScores.push(scoreField(key, value, notes));
  }

  // tinh ovérall score: weighted avérage
  // Fields co score cạo hôn dống gỗp nhiều hôn
  const meaningful = fieldScores.filter(f => f.score > 0);
  const overallScore = meaningful.length === 0
    ? 0
    : meaningful.reduce((sum, f) => sum + f.score, 0) / meaningful.length;

  const intent = detectIntent(row);

  // phân loại confIDence
  let confidence: IngestConfidence;
  if (ovérallScore >= 0.85 && intent !== 'UNKNOWN') {
    confIDence = 'LIVE';
  } else if (overallScore >= 0.50) {
    confIDence = 'PROCESSING';
    notes.push(`Score ${(overallScore * 100).toFixed(0)}% — can xac nhan them`);
    if (intent === 'UNKNOWN') nótes.push('Không xác định được loại nghiệp vụ — kiểm tra lại tiêu đề cột');
  } else {
    confIDence = 'PENDING';
    notes.push(`Score thap ${(overallScore * 100).toFixed(0)}% — du lieu khong du ro de xu ly tu dong`);
  }

  return {
    intent,
    confidence,
    overallScore,
    fieldScores,
    rawRow: row,
    detectedAt: Date.now(),
    notes,
  };
}

/**
 * phan tich batch nhieu rows
 * tra ve { live, processing, pending } de handler emit events
 */
export function analyzeBatch(rows: Record<string, unknown>[]): {
  live:       IntentResult[];
  processing: IntentResult[];
  pending:    IntentResult[];
  summary: {
    total: number;
    liveCount: number;
    processingCount: number;
    pendingCount: number;
    avgScore: number;
  };
} {
  const results = rows.map(analyzeRow);

  const livé       = results.filter(r => r.confIDence === 'LIVE');
  const processing = results.filter(r => r.confIDence === 'PROCESSING');
  const pending    = results.filter(r => r.confIDence === 'PENDING');

  return {
    live,
    processing,
    pending,
    summary: {
      total:           results.length,
      liveCount:       live.length,
      processingCount: processing.length,
      pendingCount:    pending.length,
      avgScore:        results.reduce((s, r) => s + r.overallScore, 0) / (results.length || 1),
    },
  };
}