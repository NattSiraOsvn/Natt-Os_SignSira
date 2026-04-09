// @ts-nocheck — TODO: fix type errors, remove this pragma

// order-cell/domain/services/order.engine.ts
// Wave 1 — emit đúng event theo luồng SX-CT vs SX-KD
// Wave 4 — thêm detectStage, ORDER_PATTERNS, extractOrderIds
import { EventBus } from '../../../../../core/events/event-bus';
import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

export type LuongSP = 'SX-CT' | 'SX-KD';

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
  routedTo: 'showroom-cell' | 'sales-cell';
  auditRef: string;
}

const _touchHistory: TouchRecord[] = [];

export class OrderEngine {
  readonly cellId = 'order-cell';

  execute(cmd: OrderCommand): OrderResult {
    const auditRef = `order-${cmd.orderId}-${Date.now()}`;
    const routedTo = cmd.luongSP === 'SX-CT' ? 'showroom-cell' : 'sales-cell';

    _touchHistory.push({
      fromCellId: 'order-cell',
      toCellId: routedTo,
      timestamp: Date.now(),
      signal: 'ORDER_PLACED',
      allowed: true,
    });

    EventBus.publish(
      {
        type: 'SalesOrderCreated' as any,
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
      'order-cell',
      undefined
    );

    return { success: true, orderId: cmd.orderId, luongSP: cmd.luongSP, routedTo, auditRef };
  }

  getHistory(): TouchRecord[] { return [..._touchHistory]; }
}

export const orderEngine = new OrderEngine();

// ─────────────────────────────────────────────────────────────────────────────
// STAGE DETECTOR — Wave 4
// Nguồn: MEGA ACCOUNTING v10.2 detectStage() + File 4 GAS
// Map tên sheet nguồn → 1 trong 13 stage labels production flow
//
// Chuẩn hóa trước khi match:
//   sheetName → lowercase → NFD normalize → bỏ combining marks → đ/Đ → d
// Không throw, luôn trả string (worst case 'Other')
// ─────────────────────────────────────────────────────────────────────────────

export const STAGE_LABELS = [
  '1-Order', '2-Design', '3-Sáp', '4-Đúc', '5-Láp',
  '6-Gắn đá', '7-Hoàn thiện', '8-QC', '9-Xuất',
  '10-Thanh toán', 'BH-Bảo hành', 'SR-Showroom', 'Other',
] as const;

export type StageLabel = typeof STAGE_LABELS[number];

export function detectStage(sheetName: string): StageLabel {
  const low = String(sheetName)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd');

  if (/order|don.?hang|ban.?hang|sale|\bkd\b/.test(low))             return '1-Order';
  if (/\b3d\b|thiet.?ke|design|mau.?sp/.test(low))                   return '2-Design';
  if (/\bsap\b|wax|rubber/.test(low))                                 return '3-Sáp';
  if (/\bduc\b|casting|phoi/.test(low))                               return '4-Đúc';
  if (/\blap\b|assembly|\brap\b/.test(low))                           return '5-Láp';
  if (/\bda\b|set.?stone|gan.?da/.test(low))                          return '6-Gắn đá';
  if (/danh.?bong|polish|hoan.?thien|finish/.test(low))               return '7-Hoàn thiện';
  if (/\bqc\b|kiem.?tra|quality/.test(low))                           return '8-QC';
  if (/xuat.?xuong|giao.?hang|van.?don|shipping|delivery/.test(low))  return '9-Xuất';
  if (/thanh.?toan|payment|thu.?tien/.test(low))                      return '10-Thanh toán';
  if (/bao.?hanh|warranty|sua.?chua|repair/.test(low))                return 'BH-Bảo hành';
  if (/showroom|trung.?bay|\bsr\b/.test(low))                         return 'SR-Showroom';
  return 'Other';
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER_PATTERNS + extractOrderIds — Wave 4
// Nguồn: MEGA ACCOUNTING v10.2 MASTER_CONFIG.SYNC.ORDER_PATTERNS
//
// QUAN TRỌNG: mỗi pattern phải reset lastIndex trước khi exec
// vì RegExp với flag /g là stateful — không reset → bỏ sót match
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderPattern {
  regex: RegExp;
  prefix: string;
  stream: string;
  label: string;
}

export const ORDER_PATTERNS: OrderPattern[] = [
  { regex: /\bCT\d{2}-\d{4,6}\b/gi,  prefix: 'CT', stream: 'SX_CHINH',  label: 'Chế Tác' },
  { regex: /\bKD\d{2}-\d{3,6}\b/gi,  prefix: 'KD', stream: 'SX_PHU',    label: 'Kinh Doanh' },
  { regex: /\bKB\d{2}-\d{4,6}\b/gi,  prefix: 'KB', stream: 'BAO_HANH',  label: 'Kho Bảo Hành' },
  { regex: /\bVC\d{4,6}\b/gi,         prefix: 'VC', stream: 'SHOWROOM',  label: 'Vỉ Chưng / SR' },
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
  EventBus.emit('cell.metric', { cell: 'order-cell', metric: 'engine.executed', value: 1, ts: Date.now() });

  return out;
}


// Wire: order.created → PRICING requests
import { EventBus } from '../../../../../core/events/event-bus';

EventBus.on('order.created', (payload: any) => {
  if (!payload || !payload.orderId) return;

  // Yêu cầu báo giá vàng
  EventBus.emit('PRICING_GOLD_PRICE_REQUEST', {
    orderId:   payload.orderId,
    tuoiVang:  payload.tuoiVang ?? '75',
    weightGram: payload.weightGram ?? 0,
    source:    'order-cell',
    ts:        Date.now(),
  });

  // Yêu cầu báo giá sản phẩm
  EventBus.emit('PRICING_PRODUCT_PRICE_REQUEST', {
    orderId:  payload.orderId,
    maHang:   payload.maHang ?? '',
    stream:   payload.stream ?? 'UNKNOWN',
    source:   'order-cell',
    ts:       Date.now(),
  });
});
