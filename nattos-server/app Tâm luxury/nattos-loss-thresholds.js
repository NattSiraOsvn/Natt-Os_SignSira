/**
 * NATT-OS Loss Threshold Config v1.0
 * Tâm Luxury — Ngưỡng Hao Hụt Gia Công Tối Đa
 *
 * Căn cứ:
 *  - Thực tế sản xuất trang sức vàng Việt Nam
 *  - Nghị định 24/2012/NĐ-CP về kinh doanh vàng
 *  - Tiêu chuẩn ngành kim hoàn TP.HCM
 *  - Điều 12 Hiến Pháp NATT-OS — Ground Truth
 *
 * Nguyên tắc:
 *  - Hao hụt = (Trước - Sau - Thu hồi) / Trước × 100%
 *  - Thu hồi vàng (phoi, vụn) PHẢI được cân và ghi nhận
 *  - Vượt ngưỡng → cảnh báo → KTT + Trưởng Xưởng phê duyệt
 *  - Vượt ngưỡng × 1.5 → CRITICAL → Báo Giám Đốc
 */

const LOSS_THRESHOLDS = {

  // ── NHẪN NAM ─────────────────────────────────────────
  // Trọng lượng lớn (2–5 chỉ), đúc dày, giũa nhiều
  ring_men: {
    label: 'Nhẫn Nam',
    icon: '👨',
    avgWeight: '2.5–5.0 chỉ',
    stages: {
      CASTING:       { max: 1.8, critical: 2.7, note: 'Đúc dày — vàng rót nhiều, phoi thừa thu hồi được' },
      COLD_WORK:     { max: 2.5, critical: 3.8, note: 'Giũa hình khối lớn — thu hồi phoi' },
      STONE_SETTING: { max: 0.4, critical: 0.6, note: 'Khoan ổ — ít hao' },
      FINISHING:     { max: 0.2, critical: 0.4, note: 'Nhám bóng — hao rất ít' },
    },
    totalMax: 4.9,
    totalCritical: 7.5,
  },

  // ── NHẪN NỮ ──────────────────────────────────────────
  // Mỏng, tinh tế (1–2.5 chỉ), cần kỹ thuật cao
  ring_women: {
    label: 'Nhẫn Nữ',
    icon: '👩',
    avgWeight: '1.0–2.5 chỉ',
    stages: {
      CASTING:       { max: 1.5, critical: 2.3, note: 'Đúc mỏng — cần kiểm soát nhiệt tốt' },
      COLD_WORK:     { max: 2.0, critical: 3.0, note: 'Giũa nhẹ tay do mỏng' },
      STONE_SETTING: { max: 0.5, critical: 0.8, note: 'Khoan ổ tinh tế' },
      FINISHING:     { max: 0.3, critical: 0.5, note: 'Nhám bóng' },
    },
    totalMax: 4.3,
    totalCritical: 6.6,
  },

  // ── NHẪN KẾT / NHẪN CƯỚI ────────────────────────────
  // Pair (2 chiếc), thường đơn giản hoặc cầu kỳ full diamond
  ring_couple: {
    label: 'Nhẫn Kết / Nhẫn Cưới',
    icon: '💍',
    avgWeight: '1.0–3.0 chỉ/chiếc',
    stages: {
      CASTING:       { max: 1.3, critical: 2.0, note: 'Cặp nhẫn — đúc cùng khuôn tiết kiệm vàng' },
      COLD_WORK:     { max: 1.8, critical: 2.7, note: 'Giũa nhẹ — thiết kế chuẩn hoá' },
      STONE_SETTING: { max: 0.6, critical: 0.9, note: 'Full pavé hoặc solitaire — cẩn thận' },
      FINISHING:     { max: 0.3, critical: 0.5, note: 'Nhám bóng cả cặp' },
    },
    totalMax: 4.0,
    totalCritical: 6.1,
  },

  // ── LẮC (BRACELET) ────────────────────────────────────
  // Nhiều mắt, dài 16–18cm, hao nhiều nhất
  bracelet: {
    label: 'Lắc',
    icon: '⌚',
    avgWeight: '4.0–8.0 chỉ',
    stages: {
      CASTING:       { max: 2.0, critical: 3.0, note: 'Nhiều chi tiết nhỏ, cạnh sắc — hao cao nhất' },
      COLD_WORK:     { max: 3.0, critical: 4.5, note: 'Giũa từng mắt lắc — mất nhiều thời gian và vàng' },
      STONE_SETTING: { max: 0.3, critical: 0.5, note: 'Tennis bracelet — ổ nhỏ đều' },
      FINISHING:     { max: 0.2, critical: 0.4, note: 'Bề mặt lớn — nhám toàn bộ' },
    },
    totalMax: 5.5,
    totalCritical: 8.4,
  },

  // ── DÂY CHUYỀN / CHOKER ──────────────────────────────
  // Sợi dây mảnh, dài 38–45cm
  necklace: {
    label: 'Dây Chuyền / Choker',
    icon: '📿',
    avgWeight: '2.0–5.0 chỉ',
    stages: {
      CASTING:       { max: 1.5, critical: 2.3, note: 'Đúc sợi/mắt xích — thu hồi phoi tốt' },
      COLD_WORK:     { max: 2.5, critical: 3.8, note: 'Giũa mắt xích — hao trung bình' },
      STONE_SETTING: { max: 0.2, critical: 0.4, note: 'Thường ít đá hoặc pavé nhẹ' },
      FINISHING:     { max: 0.2, critical: 0.4, note: 'Đánh bóng sợi dài' },
    },
    totalMax: 4.4,
    totalCritical: 6.9,
  },

  // ── BÔNG TAI (EARRING) ────────────────────────────────
  // Nhỏ, tinh tế, cặp đôi
  earring: {
    label: 'Bông Tai',
    icon: '💛',
    avgWeight: '0.5–1.5 chỉ/chiếc',
    stages: {
      CASTING:       { max: 1.2, critical: 1.8, note: 'Nhỏ — đúc chính xác, ít phoi' },
      COLD_WORK:     { max: 1.5, critical: 2.3, note: 'Giũa nhẹ, thao tác cẩn thận' },
      STONE_SETTING: { max: 0.5, critical: 0.8, note: 'Ổ nhỏ — cần thợ tay nghề cao' },
      FINISHING:     { max: 0.3, critical: 0.5, note: 'Bề mặt nhỏ — nhám nhanh' },
    },
    totalMax: 3.5,
    totalCritical: 5.4,
  },

  // ── MẶT DÂY (PENDANT) ────────────────────────────────
  // Phẳng, chi tiết cao, thường có đá lớn
  pendant: {
    label: 'Mặt Dây',
    icon: '🔮',
    avgWeight: '0.8–2.0 chỉ',
    stages: {
      CASTING:       { max: 1.0, critical: 1.5, note: 'Phẳng — dễ kiểm soát' },
      COLD_WORK:     { max: 1.5, critical: 2.3, note: 'Giũa viền, chi tiết nhỏ' },
      STONE_SETTING: { max: 0.5, critical: 0.8, note: 'Ổ chủ lớn — cẩn thận đặc biệt' },
      FINISHING:     { max: 0.2, critical: 0.4, note: 'Hai mặt — nhám đều' },
    },
    totalMax: 3.2,
    totalCritical: 5.0,
  },
};

// ── STAGE META ───────────────────────────────────────────
const STAGE_META = {
  CASTING:       { name: 'Tổ Đúc',      icon: '🔥', color: '#f05050', unit: '%' },
  COLD_WORK:     { name: 'Tổ Nguội',    icon: '❄️', color: '#60b8f0', unit: '%' },
  STONE_SETTING: { name: 'Tổ Hột',      icon: '💎', color: '#a78bfa', unit: '%' },
  FINISHING:     { name: 'Nhám Bóng',   icon: '✨', color: '#3dd68c', unit: '%' },
};

// ── HELPER FUNCTIONS ─────────────────────────────────────

/** Lấy ngưỡng cho 1 danh mục + công đoạn */
function getLossThreshold(category, stage) {
  const cat = LOSS_THRESHOLDS[category];
  if (!cat) return { max: 2.0, critical: 3.0 };
  return cat.stages[stage] || { max: 2.0, critical: 3.0 };
}

/** Đánh giá hao hụt thực tế */
function evaluateLoss(category, stage, actualPct) {
  const t = getLossThreshold(category, stage);
  if (actualPct <= t.max)      return { level: 'OK',       color: '#3dd68c', label: '✅ ĐẠT', threshold: t.max };
  if (actualPct <= t.critical) return { level: 'WARNING',  color: '#f0a030', label: '⚠️ CẢNH BÁO', threshold: t.max };
  return                              { level: 'CRITICAL',  color: '#f05050', label: '🚨 VƯỢT NGƯỠNG CRITICAL', threshold: t.max };
}

/** Lấy hao hụt mặc định cho pricing (dùng max của tổng = conservative) */
function getDefaultLossForPricing(category) {
  const cat = LOSS_THRESHOLDS[category];
  if (!cat) return 2.0;
  // Dùng tổng hao hụt các công đoạn làm default input pricing
  return cat.totalMax;
}

window.LOSS_THRESHOLDS  = LOSS_THRESHOLDS;
window.STAGE_META       = STAGE_META;
window.getLossThreshold = getLossThreshold;
window.evaluateLoss     = evaluateLoss;
window.getDefaultLossForPricing = getDefaultLossForPricing;

console.log('[NattOS LossThresholds] v1.0 — 7 danh mục × 4 công đoạn loaded');
