/**
 * ============================================================================
 * WAREHOUSE-CELL — INTENT DETECTOR ENGINE
 * ============================================================================
 * SCAR FS-018: TEMPLATE_TYRANNY
 * "Không được im lặng từ chối dữ liệu. Hệ thống phải luôn ghi nhận
 *  mọi đầu vào, gán trạng thái minh bạch (LIVE/PROCESSING/PENDING),
 *  và cung cấp công cụ để giải quyết tắc nghẽn."
 *
 * Kiến trúc: KHÔNG gọi cell khác trực tiếp.
 *            Emit event → cell liên quan lắng nghe.
 * ============================================================================
 */

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type WarehouseIntent =
  | 'NHAP_KHO'      // Nhập nguyên liệu / bán thành phẩm
  | 'XUAT_KHO'      // Xuất kho thành phẩm / nguyên liệu
  | 'KIEM_KE'       // Kiểm kê / điều chỉnh tồn
  | 'CHUYEN_KHO'    // Chuyển kho nội bộ
  | 'HOAN_TRA'      // Trả lại nhà cung cấp / KH trả
  | 'UNKNOWN';      // Không xác định được

export type IngestConfidence = 'LIVE' | 'PROCESSING' | 'PENDING';

export interface FieldScore {
  field: string;
  value: unknown;
  score: number;       // 0–1
  reason: string;
}

export interface IntentResult {
  intent: WarehouseIntent;
  confidence: IngestConfidence;  // LIVE / PROCESSING / PENDING
  overallScore: number;          // 0–1
  fieldScores: FieldScore[];
  rawRow: Record<string, unknown>;
  detectedAt: number;
  notes: string[];               // Giải thích cho người duyệt
}

// ─── KEYWORD DICTIONARIES ─────────────────────────────────────────────────────

const INTENT_KEYWORDS: Record<WarehouseIntent, string[]> = {
  NHAP_KHO:   ['nhập', 'nhap', 'mua', 'purchase', 'received', 'nk', 'nhập kho', 'vào kho', 'vao kho', 'receipt'],
  XUAT_KHO:   ['xuất', 'xuat', 'bán', 'ban', 'sale', 'delivery', 'xk', 'xuất kho', 'ra kho', 'giao hàng', 'ship'],
  KIEM_KE:    ['kiểm', 'kiem', 'kê', 'ke', 'tồn', 'ton', 'inventory', 'stock', 'đếm', 'dem', 'kiểm kê'],
  CHUYEN_KHO: ['chuyển', 'chuyen', 'transfer', 'điều chuyển', 'dieu chuyen', 'internal'],
  HOAN_TRA:   ['hoàn', 'hoan', 'trả', 'tra', 'return', 'refund', 'hủy', 'huy', 'cancel'],
  UNKNOWN:    [],
};

// Regex patterns cho các trường quan trọng
const PATTERNS = {
  // Mã đơn / mã hàng trang sức Tâm Luxury
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
 * Không dùng Levenshtein vì chậm với dataset lớn
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
 * Normalize chuỗi: bỏ dấu, lowercase, trim
 */
function normalize(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Score 1 field dựa trên regex pattern
 */
function scoreField(
  key: string,
  value: unknown,
  notes: string[]
): FieldScore {
  const strVal = String(value ?? '').trim();
  const normKey = normalize(key);

  // Trường rỗng → 0
  if (!strVal || strVal === '' || strVal === 'undefined' || strVal === 'null') {
    return { field: key, value, score: 0, reason: 'empty' };
  }

  // Kiểm tra theo key name + value pattern
  if (/mã|ma|sku|code|id/.test(normKey)) {
    if (PATTERNS.MA_HANG.test(strVal)) return { field: key, value, score: 1.0, reason: 'mã hàng TL khớp' };
    if (PATTERNS.MA_DON.test(strVal))  return { field: key, value, score: 1.0, reason: 'mã đơn CT/KD/KB/VC khớp' };
    if (/^[A-Z]{1,4}\d{2,8}$/i.test(strVal)) return { field: key, value, score: 0.75, reason: 'có dạng mã hàng' };
    notes.push(`Trường "${key}" có vẻ là mã nhưng không khớp pattern TL: "${strVal}"`);
    return { field: key, value, score: 0.4, reason: 'dạng mã không rõ' };
  }

  if (/ngày|ngay|date|time|tgian/.test(normKey)) {
    if (PATTERNS.NGAY.test(strVal)) return { field: key, value, score: 1.0, reason: 'ngày hợp lệ' };
    if (/\d{4}-\d{2}-\d{2}/.test(strVal)) return { field: key, value, score: 1.0, reason: 'ISO date' };
    notes.push(`Trường "${key}" có vẻ là ngày nhưng format lạ: "${strVal}"`);
    return { field: key, value, score: 0.3, reason: 'ngày không parse được' };
  }

  if (/số lượng|so luong|qty|quantity|sl/.test(normKey)) {
    const n = parseFloat(strVal.replace(/[,\.]/g, '.').replace(/[^\d.]/g, ''));
    if (!isNaN(n) && n >= 0) return { field: key, value, score: 1.0, reason: 'số lượng hợp lệ' };
    return { field: key, value, score: 0.2, reason: 'không parse được số lượng' };
  }

  if (/trọng|trong|luong|lượng|gram|kg|gold|vàng|vang/.test(normKey)) {
    if (PATTERNS.TRONG_LUONG.test(strVal)) return { field: key, value, score: 1.0, reason: 'trọng lượng hợp lệ' };
    const n = parseFloat(strVal.replace(/,/g, '.'));
    if (!isNaN(n) && n > 0) return { field: key, value, score: 0.8, reason: 'số dương, có thể là trọng lượng' };
    return { field: key, value, score: 0.2, reason: 'không parse được trọng lượng' };
  }

  if (/giá|gia|price|amount|tiền|tien|tổng|tong/.test(normKey)) {
    const n = parseFloat(strVal.replace(/[,\.]/g, '').replace(/[^\d]/g, ''));
    if (!isNaN(n) && n > 0) return { field: key, value, score: 0.9, reason: 'số tiền dương' };
    return { field: key, value, score: 0.2, reason: 'không parse được tiền' };
  }

  if (/tuổi|tuoi|purity|karat|k/.test(normKey)) {
    if (PATTERNS.TUOI_VANG.test(strVal)) return { field: key, value, score: 1.0, reason: 'tuổi vàng nhận dạng được' };
    return { field: key, value, score: 0.5, reason: 'không xác định tuổi vàng' };
  }

  if (/tên|ten|name|mô tả|mo ta|description|sp|sản phẩm|san pham/.test(normKey)) {
    if (strVal.length >= 3) return { field: key, value, score: 0.8, reason: 'tên/mô tả có nội dung' };
    return { field: key, value, score: 0.3, reason: 'tên quá ngắn' };
  }

  // Các trường khác — cho điểm trung bình nếu không rỗng
  return { field: key, value, score: 0.6, reason: 'trường có giá trị, chưa xác định loại' };
}

// ─── INTENT DETECTION ─────────────────────────────────────────────────────────

/**
 * Phát hiện intent từ toàn bộ row data
 * Quét header + value để đoán loại nghiệp vụ
 */
function detectIntent(row: Record<string, unknown>): WarehouseIntent {
  const allText = Object.entries(row)
    .flatMap(([k, v]) => [normalize(k), normalize(String(v ?? ''))])
    .join(' ');

  const scores: Partial<Record<WarehouseIntent, number>> = {};

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [WarehouseIntent, string[]][]) {
    if (intent === 'UNKNOWN') continue;
    let score = 0;
    for (const kw of keywords) {
      const sim = diceSimilarity(allText, kw);
      if (allText.includes(normalize(kw))) score += 2;   // exact match
      else if (sim > 0.6) score += sim;                   // fuzzy match
    }
    scores[intent] = score;
  }

  const best = Object.entries(scores).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0];
  if (!best || (best[1] ?? 0) < 0.5) return 'UNKNOWN';
  return best[0] as WarehouseIntent;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

/**
 * Phân tích 1 row dữ liệu thô → trả về IntentResult
 * KHÔNG ghi DB, KHÔNG gọi cell khác.
 * Caller (handler) sẽ emit event dựa trên kết quả.
 */
export function analyzeRow(row: Record<string, unknown>): IntentResult {
  const notes: string[] = [];
  const fieldScores: FieldScore[] = [];

  // Score từng field
  for (const [key, value] of Object.entries(row)) {
    if (['sourceFile', 'sourceSheet', 'syncTime', '_headerRow'].includes(key)) continue;
    fieldScores.push(scoreField(key, value, notes));
  }

  // Tính overall score: weighted average
  // Fields có score cao hơn đóng góp nhiều hơn
  const meaningful = fieldScores.filter(f => f.score > 0);
  const overallScore = meaningful.length === 0
    ? 0
    : meaningful.reduce((sum, f) => sum + f.score, 0) / meaningful.length;

  const intent = detectIntent(row);

  // Phân loại confidence
  let confidence: IngestConfidence;
  if (overallScore >= 0.85 && intent !== 'UNKNOWN') {
    confidence = 'LIVE';
  } else if (overallScore >= 0.50) {
    confidence = 'PROCESSING';
    notes.push(`Score ${(overallScore * 100).toFixed(0)}% — cần xác nhận thêm`);
    if (intent === 'UNKNOWN') notes.push('Không xác định được loại nghiệp vụ — kiểm tra lại tiêu đề cột');
  } else {
    confidence = 'PENDING';
    notes.push(`Score thấp ${(overallScore * 100).toFixed(0)}% — dữ liệu không đủ rõ để xử lý tự động`);
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
 * Phân tích batch nhiều rows
 * Trả về { live, processing, pending } để handler emit events
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

  const live       = results.filter(r => r.confidence === 'LIVE');
  const processing = results.filter(r => r.confidence === 'PROCESSING');
  const pending    = results.filter(r => r.confidence === 'PENDING');

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
