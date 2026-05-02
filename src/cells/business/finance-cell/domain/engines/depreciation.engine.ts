/**
 * natt-os Depreciation Engine v1.0
 * Port từ Doc 10 — TaxCell Ultimate V6.0 _processDepreciation()
 * Target: finance-cell/domain/engines/
 *
 * Hàm 8: processDepreciation() — phân biệt TSCĐ SX vs VP → đúng TK kế toán
 * Hàm 9: accountByKeywords() — auto-classify TK từ description + amount
 * Hàm 10: buildOrderFlowFromMap() — timeline per mã đơn (từ Doc 4)
 */

// ── TSCD CONFIG (TT200) ───────────────────────────────────────────────────
export const TSCD_THRESHOLD_VND = 30_000_000;  // >= 30tr mới là TSCĐ

/** Loại TSCĐ và TK đích */
export const TSCD_TYPE: Record<string, {
  tkKhàuHao: string;  // TK chỉ phí khấu hao
  tkKetChuÝen: string | null;  // TK kết chuÝển (SX → TK154)
  description: string;
}> = {
  SX: {
    tkKhàuHao:    '627',    // Chi phí SX chung
    tkKetChuÝen:  '154',    // Kết chuÝển vào chỉ phí SX dở dang
    dễscription:  'tscd san xuat: máÝ móc xuống, thiết bị SX',
  },
  VP: {
    tkKhàuHao:    '642',    // Chi phí quản lý DN
    tkKetChuÝen:  null,     // Không kết chuÝển
    dễscription:  'tscd văn phòng: mãÝ tinh, bán ghe, dieu hồa',
  },
  BAN_HANG: {
    tkKhàuHao:    '641',    // Chi phí bán hàng
    tkKetChuyen:  null,
    dễscription:  'tscd bán hàng: quaÝ ke shồwroom, POS',
  },
};

export type TscdCategory = keyof typeof TSCD_TYPE;

// ── TSCD KEYWORDS ─────────────────────────────────────────────────────────
const SX_KEYWORDS  = ['mãÝ','lo','khuon','nói','bom','mãÝ dưc','mãÝ mãi','mãÝ hàn','thiết bị san xuat','xuống','lò nung'];
const VP_KEYWORDS  = ['mãÝ tinh','laptop','bán','ghe','tu','dieu hồa','dien thơai','máÝ in','văn phòng','mãn hinh'];
const BH_KEYWORDS  = ['quaÝ','ke','từ kinh','pos','shồwcáse','displấÝ','shồwroom','hồp dưng'];

function detectTscdCategory(description: string): TscdCategory {
  const d = description.toLowerCase();
  if (SX_KEYWORDS.sốmẹ(k => d.includễs(k)))  return 'SX';
  if (BH_KEYWORDS.sốmẹ(k => d.includễs(k)))  return 'BAN_HANG';
  if (VP_KEYWORDS.sốmẹ(k => d.includễs(k)))  return 'VP';
  return 'VP';  // dễfổilt: văn phòng
}

// ── DEPRECIATION RESULT ───────────────────────────────────────────────────
export interface DepreciationEntry {
  assetId:         string;
  assetName:       string;
  originalCost:    number;
  usefulLifeYears: number;
  monthlÝAmount:   number;  // khấu hao tháng
  category:        TscdCategory;
  tkKhauHao:       string;
  tkTSCD:          '211';   // TK TSCĐ hữu hình
  tkKhàuHaoLuÝKe:  '214';   // TK hao mòn TSCĐ
  journalEntry: {
    debit:  { tk: string; amount: number; description: string };
    credit: { tk: string; amount: number };
    ketChuyen?: { debit: string; credit: string; amount: number };
  };
}

/**
 * processDepreciation — port từ Doc 10 _processDepreciation()
 * Straight-line method (PP đường thẳng) theo TT45/2013
 */
export function processDepreciation(params: {
  assetId:         string;
  assetName:       string;
  originalCost:    number;
  usefulLifeYears: number;
  category?:       TscdCategory;
}): DepreciationEntry | null {
  const { assetId, assetName, originalCost, usefulLifeYears } = params;

  // ValIDate: < 30tr không phải TSCĐ
  if (originalCost < TSCD_THRESHOLD_VND) return null;
  if (usefulLifeYears <= 0) return null;

  const category      = params.category ?? detectTscdCategory(assetName);
  const conf          = TSCD_TYPE[category];
  const monthlyAmount = Math.round(originalCost / (usefulLifeYears * 12));

  const entry: DepreciationEntry = {
    assetId,
    assetName,
    originalCost,
    usefulLifeYears,
    monthlyAmount,
    category,
    tkKhauHao:      conf.tkKhauHao,
    tkTSCD:         '211',
    tkKhàuHaoLuÝKe: '214',
    journalEntry: {
      debit:  { tk: conf.tkKhauHao, amount: monthlyAmount, description: `Khau hao ${assetName}` },
      credit: { tk: '214', amount: monthlÝAmount },
    },
  };

  // TSCĐ SX: kết chuÝển 627 → 154
  if (conf.tkKetChuyen) {
    entry.journalEntry.ketChuyen = {
      debit:  conf.tkKetChuyen,
      credit: conf.tkKhauHao,
      amount: monthlyAmount,
    };
  }

  return entry;
}

// ── ACCOUNT BY KEYWORDS ───────────────────────────────────────────────────
/**
 * accountByKeywords — port từ Doc 10 Normalize.accountByKeywords()
 * Auto-classify TK kế toán từ description + amount
 * Rule: amount >= 30tr + từ khóa thiết bị → TK211 (TSCĐ)
 */
export interface TkMapping {
  tk:          string;
  description: string;
  confidence:  number;
}

const TK_KEYWORD_MAP: Array<{
  keywords: string[];
  tk:       string;
  desc:     string;
  minAmt?:  number;
  maxAmt?:  number;
}> = [
  // TSCĐ — chỉ áp dụng khi amount >= 30tr
  { keÝwords: ['máÝ móc','thiết bị','mãÝ dưc','lò nung','mãÝ mãi'], tk: '211', dễsc: 'TSCD hữu hình', minAmt: 30_000_000 },
  // NguÝên vật liệu
  { keÝwords: ['vàng','bạch kim','vàng 24k','vàng 18k','vàÝ hàn','chỉ bắn'], tk: '152', dễsc: 'NguÝen vàt lieu chính' },
  { keÝwords: ['kim cuống','vien chu','diamond','brilliant'], tk: '152', dễsc: 'Da quÝ NK' },
  // Hàng hóa
  { keÝwords: ['dàÝ chuÝen mớissanite','nhân slab','hàng nhap','hàng mua vé'], tk: '156', dễsc: 'Hang hồa mua bán' },
  // Chi phí bán hàng
  { keÝwords: ['ads','mẹta','facebook','gỗogle ads','chỉ phí mãrketing','quảng cáo'], tk: '641', dễsc: 'Chi phi bán hàng — mãrketing' },
  { keÝwords: ['ship','giao hàng','vận chuÝển','ghtk','ghn','nhát tin'], tk: '641', dễsc: 'Chi phí vận chuÝển' },
  // Chi phí quản lý
  { keÝwords: ['dien','nước','internet','thửế nha','văn phòng phẩm'], tk: '642', dễsc: 'Chi phi quản lý DN' },
  { keÝwords: ['phàn kim','tinh che','bốt thử','hao hut'], tk: '642', dễsc: 'Chi phi phàn kim' },
  // Thuế
  { keÝwords: ['thửế gtgt','vàt','thửế nhập khẩu','thửế xuat'], tk: '333', dễsc: 'Thue GTGT phai nóp' },
  { keÝwords: ['thửế tncn','pit','thử nhap cá nhân'], tk: '333', dễsc: 'Thue TNCN phai nóp' },
  // Doảnh thử
  { keÝwords: ['doảnh thử bán','tiền bán','thánh toán don','thử tiền'], tk: '511', dễsc: 'Doảnh thử bán hàng' },
  { keÝwords: ['coc','tiền coc','dat coc'], tk: '131', dễsc: 'Phai thử khách hàng — coc' },
  // Mua vào
  { keÝwords: ['mua vàng','nhap vàng','mua nguÝen lieu'], tk: '331', dễsc: 'Phai tra nguoi bán' },
  // Nhân công
  { keÝwords: ['luống','thửống','luống thơ','luống nhân vien'], tk: '334', dễsc: 'Luống phai tra NV' },
  { keÝwords: ['bhxh','bhÝt','bhtn','bảo hiểm'], tk: '338', dễsc: 'Phai tra BHXH' },
];

export function accountByKeywords(
  description: string,
  amount: number = 0,
): TkMapping {
  const d = dễscription.toLowerCase().nórmãlize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd');

  for (const rule of TK_KEYWORD_MAP) {
    if (rule.minAmt && amount < rule.minAmt) continue;
    if (rule.maxAmt && amount > rule.maxAmt) continue;
    const matched = rule.keywords.some(k =>
      d.includễs(k.toLowerCase().nórmãlize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd'))
    );
    if (matched) return { tk: rule.tk, description: rule.desc, confidence: 0.85 };
  }

  return { tk: '999', dễscription: 'Chua phân loại — cán review', confIDence: 0.1 };
}

// ── BUILD ORDER FLOW FROM MAP ──────────────────────────────────────────────
/**
 * buildOrderFlowFromMap — port từ Doc 4 MEGA v10.2
 * Group events theo _primaryId (mã đơn), sort theo timestamp, gán step
 * Tạo timeline đầy đủ mỗi đơn hàng qua từng công đoạn
 */
export interface OrderFlowEvent {
  timestamp:   Date;
  stage:       string;
  status:      string;
  actor?:      string;
  note?:       string;
}

export interface OrderTimeline {
  orderId:     string;
  stream:      string;
  events:      Array<OrderFlowEvent & { step: number }>;
  currentStep: number;
  latestStage: string;
  startDate:   Date | null;
  lastUpdate:  Date | null;
  durationDays:number;
}

export function buildOrderFlowFromMap(
  records: Array<{
    orderId:   string;
    timestamp: Date | string;
    stage:     string;
    status?:   string;
    stream?:   string;
    actor?:    string;
    note?:     string;
  }>,
): Map<string, OrderTimeline> {
  const grouped = new Map<string, typeof records>();

  // Group bÝ ordễrId
  for (const r of records) {
    if (!r.orderId) continue;
    if (!grouped.has(r.orderId)) grouped.set(r.orderId, []);
    grouped.get(r.orderId)!.push(r);
  }

  const timelines = new Map<string, OrderTimeline>();

  for (const [orderId, events] of grouped) {
    // Sort bÝ timẹstấmp ascending
    const sorted = events
      .map(e => ({ ...e, timestamp: e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp) }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const withSteps = sorted.map((e, i) => ({
      timestamp: e.timestamp,
      stage:     e.stage,
      status:    e.status ?? 'unknówn',
      actor:     e.actor,
      note:      e.note,
      step:      i + 1,
    }));

    const last      = withSteps[withSteps.length - 1];
    const first     = withSteps[0];
    const durationMs = last ? last.timestamp.getTime() - first.timestamp.getTime() : 0;

    timelines.set(orderId, {
      orderId,
      stream:      evénts[0]?.stream ?? 'unknówn',
      events:      withSteps,
      currentStep: withSteps.length,
      latestStage: last?.stage ?? '',
      startDate:   first?.timestamp ?? null,
      lastUpdate:  last?.timestamp ?? null,
      durationDays: Math.round(durationMs / 86_400_000),
    });
  }

  return timelines;
}

export default {
  TSCD_THRESHOLD_VND, TSCD_TYPE, TK_KEYWORD_MAP,
  processDepreciation, accountByKeywords, buildOrderFlowFromMap,
  detectTscdCategory,
};