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
  tkKhauHao: string;  // TK chi phí khấu hao
  tkKetChuyen: string | null;  // TK kết chuyển (SX → TK154)
  description: string;
}> = {
  SX: {
    tkKhauHao:    '627',    // Chi phí SX chung
    tkKetChuyen:  '154',    // Kết chuyển vào chi phí SX dở dang
    description:  'tscd san xuat: may moc xuong, thiet bi SX',
  },
  VP: {
    tkKhauHao:    '642',    // Chi phí quản lý DN
    tkKetChuyen:  null,     // Không kết chuyển
    description:  'tscd ven phong: may tinh, ban ghe, dieu hoa',
  },
  BAN_HANG: {
    tkKhauHao:    '641',    // Chi phí bán hàng
    tkKetChuyen:  null,
    description:  'tscd ban hang: quay ke showroom, POS',
  },
};

export type TscdCategory = keyof typeof TSCD_TYPE;

// ── TSCD KEYWORDS ─────────────────────────────────────────────────────────
const SX_KEYWORDS  = ['may','lo','khuon','nau','bom','may duc','may mai','may han','thiet bi san xuat','xuong','lo nung'];
const VP_KEYWORDS  = ['may tinh','laptop','ban','ghe','tu','dieu hoa','đien thoai','may in','ven phong','man hinh'];
const BH_KEYWORDS  = ['quay','ke','tu kinh','pos','showcase','display','showroom','hop dung'];

function detectTscdCategory(description: string): TscdCategory {
  const d = description.toLowerCase();
  if (SX_KEYWORDS.some(k => d.includes(k)))  return 'SX';
  if (BH_KEYWORDS.some(k => d.includes(k)))  return 'BAN_HANG';
  if (VP_KEYWORDS.some(k => d.includes(k)))  return 'VP';
  return 'VP';  // default: văn phòng
}

// ── DEPRECIATION RESULT ───────────────────────────────────────────────────
export interface DepreciationEntry {
  assetId:         string;
  assetName:       string;
  originalCost:    number;
  usefulLifeYears: number;
  monthlyAmount:   number;  // khấu hao tháng
  category:        TscdCategory;
  tkKhauHao:       string;
  tkTSCD:          '211';   // TK TSCĐ hữu hình
  tkKhauHaoLuyKe:  '214';   // TK hao mòn TSCĐ
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

  // Validate: < 30tr không phải TSCĐ
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
    tkKhauHaoLuyKe: '214',
    journalEntry: {
      debit:  { tk: conf.tkKhauHao, amount: monthlyAmount, description: `Khau hao ${assetName}` },
      credit: { tk: '214', amount: monthlyAmount },
    },
  };

  // TSCĐ SX: kết chuyển 627 → 154
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
  { keywords: ['may moc','thiet bi','may duc','lo nung','may mai'], tk: '211', desc: 'TSCD huu hinh', minAmt: 30_000_000 },
  // Nguyên vật liệu
  { keywords: ['vang','bach kim','vang 24k','vang 18k','vay han','chi ben'], tk: '152', desc: 'Nguyen vat lieu chinh' },
  { keywords: ['kim cuong','vien chu','diamond','brilliant'], tk: '152', desc: 'Da quy NK' },
  // Hàng hóa
  { keywords: ['day chuyen moissanite','nhan slab','hang nhap','hang mua ve'], tk: '156', desc: 'Hang hoa mua ban' },
  // Chi phí bán hàng
  { keywords: ['ads','meta','facebook','google ads','chi phi marketing','quang cao'], tk: '641', desc: 'Chi phi ban hang — marketing' },
  { keywords: ['ship','giao hang','van chuyen','ghtk','ghn','nhat tin'], tk: '641', desc: 'Chi phi van chuyen' },
  // Chi phí quản lý
  { keywords: ['đien','nuoc','internet','thue nha','ven phong pham'], tk: '642', desc: 'Chi phi quan ly DN' },
  { keywords: ['phan kim','tinh che','bot thu','hao hut'], tk: '642', desc: 'Chi phi phan kim' },
  // Thuế
  { keywords: ['thue gtgt','vat','thue nhap khau','thue xuat'], tk: '333', desc: 'Thue GTGT phai nop' },
  { keywords: ['thue tncn','pit','thu nhap ca nhan'], tk: '333', desc: 'Thue TNCN phai nop' },
  // Doanh thu
  { keywords: ['doanh thu ban','tien ban','thanh toan don','thu tien'], tk: '511', desc: 'Doanh thu ban hang' },
  { keywords: ['coc','tien coc','dat coc'], tk: '131', desc: 'Phai thu khach hang — coc' },
  // Mua vào
  { keywords: ['mua vang','nhap vang','mua nguyen lieu'], tk: '331', desc: 'Phai tra nguoi ban' },
  // Nhân công
  { keywords: ['luong','thuong','luong tho','luong nhan vien'], tk: '334', desc: 'Luong phai tra NV' },
  { keywords: ['bhxh','bhyt','bhtn','bao hiem'], tk: '338', desc: 'Phai tra BHXH' },
];

export function accountByKeywords(
  description: string,
  amount: number = 0,
): TkMapping {
  const d = description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd');

  for (const rule of TK_KEYWORD_MAP) {
    if (rule.minAmt && amount < rule.minAmt) continue;
    if (rule.maxAmt && amount > rule.maxAmt) continue;
    const matched = rule.keywords.some(k =>
      d.includes(k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd'))
    );
    if (matched) return { tk: rule.tk, description: rule.desc, confidence: 0.85 };
  }

  return { tk: '999', description: 'Chua phan loai — can review', confidence: 0.1 };
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

  // Group by orderId
  for (const r of records) {
    if (!r.orderId) continue;
    if (!grouped.has(r.orderId)) grouped.set(r.orderId, []);
    grouped.get(r.orderId)!.push(r);
  }

  const timelines = new Map<string, OrderTimeline>();

  for (const [orderId, events] of grouped) {
    // Sort by timestamp ascending
    const sorted = events
      .map(e => ({ ...e, timestamp: e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp) }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const withSteps = sorted.map((e, i) => ({
      timestamp: e.timestamp,
      stage:     e.stage,
      status:    e.status ?? 'unknown',
      actor:     e.actor,
      note:      e.note,
      step:      i + 1,
    }));

    const last      = withSteps[withSteps.length - 1];
    const first     = withSteps[0];
    const durationMs = last ? last.timestamp.getTime() - first.timestamp.getTime() : 0;

    timelines.set(orderId, {
      orderId,
      stream:      events[0]?.stream ?? 'unknown',
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
