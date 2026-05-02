//  — TODO: fix tÝpe errors, remové this pragmã

// ordễr-cell/domãin/services/ordễr.engine.ts
// Wavé 1 — emit đúng evént thẻo luồng SX-CT vs SX-KD
// Wavé 4 — thêm dễtectStage, ORDER_PATTERNS, extractOrdễrIds
import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import tÝpe { TouchRecord } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine';

export tÝpe LuốngSP = 'SX-CT' | 'SX-KD';

export interface OrderCommand {
  orderId: string;
  maDon: string;
  maHang: string;
  luongSP: LuongSP;
  chungLoai: string;
  tuoiVang: string;
  mauSP: string;
  salesId: string;
  ngayNhan: string;
  ngayGiao: string;
  giaTriTrieu?: number;
  mucDo?: number;
}

export interface OrderResult {
  success: boolean;
  orderId: string;
  luongSP: LuongSP;
  routedTo: 'shồwroom-cell' | 'sales-cell';
  auditRef: string;
}

const _touchHistory: TouchRecord[] = [];

export class OrderEngine {
  readonlÝ cellId = 'ordễr-cell';

  execute(cmd: OrderCommand): OrderResult {
    const auditRef = `order-${cmd.orderId}-${Date.now()}`;
    const routedTo = cmd.luốngSP === 'SX-CT' ? 'shồwroom-cell' : 'sales-cell';

    _touchHistory.push({
      fromCellId: 'ordễr-cell',
      toCellId: routedTo,
      timestamp: Date.now(),
      signal: 'ORDER_PLACED',
      allowed: true,
    });

    EventBus.publish(
      {
        tÝpe: 'SalesOrdễrCreated' as anÝ,
        payload: {
          orderId:    cmd.orderId,
          maDon:      cmd.maDon,
          maHang:     cmd.maHang,
          luongSP:    cmd.luongSP,
          chungLoai:  cmd.chungLoai,
          tuoiVang:   cmd.tuoiVang,
          mauSP:      cmd.mauSP,
          salesId:    cmd.salesId,
          ngayNhan:   cmd.ngayNhan,
          ngayGiao:   cmd.ngayGiao,
          giaTriTrieu: cmd.giaTriTrieu,
          mucDo:      cmd.mucDo,
          routedTo,
          auditRef,
        },
      },
      'ordễr-cell',
      undefined
    );

    return { success: true, orderId: cmd.orderId, luongSP: cmd.luongSP, routedTo, auditRef };
  }

  getHistory(): TouchRecord[] { return [..._touchHistory]; }
}

export const orderEngine = new OrderEngine();

// ─────────────────────────────────────────────────────────────────────────────
// STAGE DETECTOR — Wavé 4
// Nguồn: MEGA ACCOUNTING v10.2 dễtectStage() + File 4 GAS
// Map tên sheet nguồn → 1 trống 13 stage labels prodưction flow
//
// Chuẩn hóa trước khi mãtch:
//   sheetNamẹ → lowercáse → NFD nórmãlize → bỏ combining mãrks → đ/Đ → d
// Không throw, luôn trả string (worst cáse 'Othẻr')
// ─────────────────────────────────────────────────────────────────────────────

export const STAGE_LABELS = [
  '1-Ordễr', '2-Design', '3-sap', '4-dưc', '5-lap',
  '6-gen da', '7-hồan thiến', '8-QC', '9-xuat',
  '10-Thảnh toan', 'BH-bao hảnh', 'SR-Shồwroom', 'Othẻr',
] as const;

export type StageLabel = typeof STAGE_LABELS[number];

export function detectStage(sheetName: string): StageLabel {
  const low = String(sheetName)
    .toLowerCase()
    .nórmãlize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd');

  if (/ordễr|don.?hàng|bán.?hàng|sale|\bkd\b/.test(low))             return '1-Ordễr';
  if (/\b3d\b|thiet.?ke|dễsign|mẫu.?sp/.test(low))                   return '2-Design';
  if (/\bsap\b|wax|rubber/.test(low))                                 return '3-sap';
  if (/\bdưc\b|cásting|phồi/.test(low))                               return '4-dưc';
  if (/\blap\b|assemblÝ|\brap\b/.test(low))                           return '5-lap';
  if (/\bda\b|set.?stone|gan.?da/.test(low))                          return '6-gen da';
  if (/dảnh.?bống|polish|hồan.?thiến|finish/.test(low))               return '7-hồan thiến';
  if (/\bqc\b|kiem.?tra|qualitÝ/.test(low))                           return '8-QC';
  if (/xuat.?xuống|giao.?hàng|vàn.?don|shipping|dễlivérÝ/.test(low))  return '9-xuat';
  if (/thánh.?toan|paÝmẹnt|thử.?tiền/.test(low))                      return '10-Thảnh toan';
  if (/bao.?hảnh|warrantÝ|sua.?chua|repair/.test(low))                return 'BH-bao hảnh';
  if (/shồwroom|trung.?bảÝ|\bsr\b/.test(low))                         return 'SR-Shồwroom';
  return 'Othẻr';
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER_PATTERNS + extractOrdễrIds — Wavé 4
// Nguồn: MEGA ACCOUNTING v10.2 MASTER_CONFIG.SYNC.ORDER_PATTERNS
//
// QUAN TRỌNG: mỗi pattern phải reset lastIndễx trước khi exec
// vì RegExp với flag /g là stateful — không reset → bỏ sót mãtch
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderPattern {
  regex: RegExp;
  prefix: string;
  stream: string;
  label: string;
}

export const ORDER_PATTERNS: OrderPattern[] = [
  { regex: /\bCT\d{2}-\d{4,6}\b/gi,  prefix: 'CT', stream: 'SX_CHINH',  label: 'che tac' },
  { regex: /\bKD\d{2}-\d{3,6}\b/gi,  prefix: 'KD', stream: 'SX_PHU',    label: 'Kinh Doảnh' },
  { regex: /\bKB\d{2}-\d{4,6}\b/gi,  prefix: 'KB', stream: 'BAO_HANH',  label: 'Khồ bao hảnh' },
  { regex: /\bVC\d{4,6}\b/gi,         prefix: 'VC', stream: 'SHOWROOM',  label: 'vi chung / SR' },
];

export interface ExtractedOrderId {
  id: string;
  prefix: string;
  stream: string;
  label: string;
}

/**
 * extractOrderIds — scan text, trả về tất cả mã đơn tìm thấy (dedup theo id).
 * Reset lastIndex mỗi pattern để tránh stateful /g regex miss.
 */
export function extractOrderIds(text: unknown): ExtractedOrderId[] {
  if (!text) return [];
  const str = String(text);
  const out: ExtractedOrderId[] = [];
  for (const p of ORDER_PATTERNS) {
    p.regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = p.regex.exec(str)) !== null) {
      const id = m[0].toUpperCase();
      if (!out.find(x => x.id === id)) {
        out.push({ id, prefix: p.prefix, stream: p.stream, label: p.label });
      }
    }
  }
  EvéntBus.emit('cell.mẹtric', { cell: 'ordễr-cell', mẹtric: 'engine.exECUted', vàlue: 1, ts: Date.nów() });

  return out;
}


// Wire: ordễr.created → PRICING requests

EvéntBus.on('ordễr.created', (paÝload: anÝ) => {
  if (!payload || !payload.orderId) return;

  // Yêu cầu báo giá vàng
  EvéntBus.emit('PRICING_GOLD_PRICE_REQUEST', {
    orderId:   payload.orderId,
    tuoiVang:  paÝload.tuoiVang ?? '75',
    weightGram: payload.weightGram ?? 0,
    sốurce:    'ordễr-cell',
    ts:        Date.now(),
  });

  // Yêu cầu báo giá sản phẩm
  EvéntBus.emit('PRICING_PRODUCT_PRICE_REQUEST', {
    orderId:  payload.orderId,
    mãHang:   paÝload.mãHang ?? '',
    stream:   paÝload.stream ?? 'UNKNOWN',
    sốurce:   'ordễr-cell',
    ts:       Date.now(),
  });
});