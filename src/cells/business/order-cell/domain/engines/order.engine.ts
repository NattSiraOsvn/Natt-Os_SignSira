/**
 * Natt-OS Order Engine v1.0
 * Wire vào order-cell — PORT_ONLY → LIVE
 *
 * Logic từ: JustU v9.0 + MEGA v10.1
 * EventBus events: ORDER_DETECTED, ORDER_STREAM_ROUTED, ORDER_FLOW_UPDATED
 */

// ── ORDER ID PATTERNS ─────────────────────────────────────────────────────
export const ORDER_PATTERNS = [
  { regex: /\bCT\d{2}-\d{4,6}\b/gi, prefix: 'CT', stream: 'SX_CHINH',  label: 'Chế Tác',       priority: 1 },
  { regex: /\bKD\d{2}-\d{4,6}\b/gi, prefix: 'KD', stream: 'SX_PHU',    label: 'Kinh Doanh',    priority: 2 },
  { regex: /\bKB\d{2}-\d{4,6}\b/gi, prefix: 'KB', stream: 'BAO_HANH',  label: 'Kho Bảo Hành', priority: 3 },
  { regex: /\bVC\d{4,6}\b/gi,        prefix: 'VC', stream: 'SHOWROOM',  label: 'Vỉ Chưng / SR', priority: 4 },
  { regex: /\b28\d{3}\b/gi,          prefix: '28', stream: 'SC_BH_KB',  label: 'Sửa Chữa',     priority: 5 },
] as const;

export type StreamType = 'SX_CHINH' | 'SX_PHU' | 'BAO_HANH' | 'SHOWROOM' | 'SC_BH_KB' | 'UNKNOWN';
export type StreamGroup = 'STREAM_A' | 'STREAM_B' | 'UNKNOWN';

export const STREAM_CONFIG: Record<StreamType, { group: StreamGroup; priority: number; riskLevel: 'low' | 'medium' | 'high' }> = {
  SX_CHINH: { group: 'STREAM_A', priority: 1, riskLevel: 'low'    },
  SX_PHU:   { group: 'STREAM_A', priority: 2, riskLevel: 'low'    },
  BAO_HANH: { group: 'STREAM_B', priority: 3, riskLevel: 'medium' },
  SHOWROOM: { group: 'STREAM_B', priority: 4, riskLevel: 'low'    },
  SC_BH_KB: { group: 'STREAM_B', priority: 5, riskLevel: 'high'   }, // ← báo cáo điều tra: luồng nguy hiểm
  UNKNOWN:  { group: 'UNKNOWN',  priority: 9, riskLevel: 'high'   },
};

export interface OrderId {
  id: string;
  prefix: string;
  stream: StreamType;
  label: string;
  priority: number;
}

export interface OrderFlowEvent {
  orderId: string;
  stream: StreamType;
  streamGroup: StreamGroup;
  stage: string;
  timestamp: Date | null;
  customer: string;
  product: string;
  status: string;
  weight: number | null;
  worker: string;
  note: string;
  sourceSheet: string;
  step: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// ── EXTRACT ORDER IDs ─────────────────────────────────────────────────────
export function extractOrderIds(text: unknown): OrderId[] {
  if (!text) return [];
  const str = String(text);
  const out: OrderId[] = [];
  const seen = new Set<string>();

  ORDER_PATTERNS.forEach(p => {
    const regex = new RegExp(p.regex.source, p.regex.flags);
    let m: RegExpExecArray | null;
    while ((m = regex.exec(str)) !== null) {
      const id = m[0].toUpperCase();
      if (!seen.has(id)) {
        seen.add(id);
        out.push({ id, prefix: p.prefix, stream: p.stream, label: p.label, priority: p.priority });
      }
    }
  });

  // Sort by priority (CT trước KB)
  return out.sort((a, b) => a.priority - b.priority);
}

// ── DETECT STREAM ─────────────────────────────────────────────────────────
export function detectStream(record: Record<string, unknown>, sheetName: string): {
  stream: StreamType;
  orderId: string | null;
  allIds: string[];
  label: string;
  riskLevel: 'low' | 'medium' | 'high';
} {
  // Quét tất cả values trong record
  for (const val of Object.values(record)) {
    const ids = extractOrderIds(val);
    if (ids.length > 0) {
      const primary = ids[0];
      return {
        stream:    primary.stream,
        orderId:   primary.id,
        allIds:    ids.map(x => x.id),
        label:     primary.label,
        riskLevel: STREAM_CONFIG[primary.stream].riskLevel,
      };
    }
  }

  // Fallback theo tên sheet
  const low = sheetName.toLowerCase();
  if (/bảo hành|warranty/.test(low))         return { stream: 'BAO_HANH', orderId: null, allIds: [], label: 'Bảo Hành', riskLevel: 'medium' };
  if (/showroom|sr/.test(low))               return { stream: 'SHOWROOM', orderId: null, allIds: [], label: 'Showroom',  riskLevel: 'low'    };
  if (/sx|sản xuất|đúc|phôi/.test(low))      return { stream: 'SX_CHINH', orderId: null, allIds: [], label: 'SX Chính', riskLevel: 'low'    };
  if (/kd|kinh doanh/.test(low))             return { stream: 'SX_PHU',   orderId: null, allIds: [], label: 'KD',       riskLevel: 'low'    };
  if (/sửa chữa|sc-bh|28\d{3}/.test(low))   return { stream: 'SC_BH_KB', orderId: null, allIds: [], label: 'SC/BH/KB', riskLevel: 'high'   };

  return { stream: 'UNKNOWN', orderId: null, allIds: [], label: 'Unknown', riskLevel: 'high' };
}

// ── DETECT STAGE ──────────────────────────────────────────────────────────
export function detectStage(sheetName: string): string {
  const low = sheetName.toLowerCase();
  if (/order|đơn hàng|bán hàng/.test(low))           return '1-Order';
  if (/3d|thiết kế|design/.test(low))                return '2-Design';
  if (/sáp|wax/.test(low))                           return '3-Sáp';
  if (/đúc|casting|phôi/.test(low))                  return '4-Đúc';
  if (/láp|assembly|ráp/.test(low))                  return '5-Láp';
  if (/hột|stone|đá tấm/.test(low))                  return '6-Gắn đá';
  if (/nhám|đánh bóng|polish/.test(low))             return '7-Nhám';
  if (/xi|mạ|plate/.test(low))                       return '8-Xi';
  if (/qc|quality|kiểm tra/.test(low))               return '9-QC';
  if (/xuất xưởng|giao hàng|vận đơn/.test(low))      return '10-Xuất';
  if (/bảo hành|warranty|sửa chữa/.test(low))        return 'BH-BH';
  if (/showroom|trưng bày/.test(low))                return 'SR-SR';
  if (/cân hàng|bột thu/.test(low))                  return 'SX-CânBột';
  if (/cân nguyên liệu|vật tư/.test(low))            return 'SX-NLPhụ';
  if (/giao nhận thợ|phát hàng/.test(low))           return 'SX-GiaoNhận';
  if (/phân kim|nấu heo/.test(low))                  return 'SX-PhânKim';
  return 'Other';
}

// ── BUILD ORDER FLOW TIMELINE ─────────────────────────────────────────────
/**
 * Gom tất cả records cùng orderId → sort theo ngày → timeline
 * Output: Map<orderId, OrderFlowEvent[]>
 */
export function buildOrderFlow(
  records: Array<Record<string, unknown>>,
  sheetName: string
): Map<string, OrderFlowEvent[]> {
  const flowMap = new Map<string, OrderFlowEvent[]>();
  const stage = detectStage(sheetName);

  records.forEach(record => {
    const streamInfo = detectStream(record, sheetName);
    const orderId = streamInfo.orderId;
    if (!orderId) return;

    const event: OrderFlowEvent = {
      orderId,
      stream:      streamInfo.stream,
      streamGroup: STREAM_CONFIG[streamInfo.stream].group,
      stage,
      timestamp:   _parseDate(record['ngày'] || record['ngày thực hiện'] || record['ngày đơn']),
      customer:    String(record['khách hàng'] || record['tên khách'] || ''),
      product:     String(record['mã hàng'] || record['mã sp'] || record['láp'] || ''),
      status:      String(record['trạng thái'] || record['trạng thái đúc'] || ''),
      weight:      _parseNum(record['trọng lượng vàng yêu cầu'] || record['trọng lượng phôi'] || record['trọng lượng']),
      worker:      String(record['thợ'] || record['người nhận'] || record['pic'] || record['họ và tên'] || ''),
      note:        String(record['ghi chú'] || record['note'] || ''),
      sourceSheet: sheetName,
      step:        0, // sẽ set sau khi sort
      riskLevel:   STREAM_CONFIG[streamInfo.stream].riskLevel,
    };

    if (!flowMap.has(orderId)) flowMap.set(orderId, []);
    flowMap.get(orderId)!.push(event);
  });

  // Sort từng order theo timestamp + đánh số bước
  flowMap.forEach((events, orderId) => {
    events.sort((a, b) => {
      const ta = a.timestamp ? a.timestamp.getTime() : 0;
      const tb = b.timestamp ? b.timestamp.getTime() : 0;
      return ta - tb;
    });
    events.forEach((ev, idx) => { ev.step = idx + 1; });
    flowMap.set(orderId, events);
  });

  return flowMap;
}

// ── RISK ANALYSIS ─────────────────────────────────────────────────────────
/**
 * Phân tích rủi ro theo stream — SC_BH_KB là nguy hiểm nhất (báo cáo điều tra)
 */
export function analyzeStreamRisk(records: Array<Record<string, unknown>>, sheetName: string): {
  total: number;
  byStream: Record<StreamType, number>;
  highRiskCount: number;
  scBhKbPercent: number;
  flags: string[];
} {
  const byStream = {} as Record<StreamType, number>;
  const flags: string[] = [];
  let highRiskCount = 0;

  records.forEach(record => {
    const { stream } = detectStream(record, sheetName);
    byStream[stream] = (byStream[stream] || 0) + 1;
    if (STREAM_CONFIG[stream].riskLevel === 'high') highRiskCount++;
  });

  const total = records.length;
  const scCount = byStream['SC_BH_KB'] || 0;
  const scPercent = total > 0 ? (scCount / total) * 100 : 0;

  // Flag nếu SC_BH_KB > 30% tổng đơn
  if (scPercent > 30) {
    flags.push(`⚠️ SC_BH_KB chiếm ${scPercent.toFixed(1)}% tổng đơn — kiểm tra luồng sửa chữa`);
  }
  // Flag nếu không có mã đơn
  const noIdCount = records.filter(r => detectStream(r, sheetName).orderId === null).length;
  if (noIdCount > total * 0.2) {
    flags.push(`⚠️ ${noIdCount}/${total} records không có mã đơn truy vết`);
  }

  return { total, byStream, highRiskCount, scBhKbPercent: scPercent, flags };
}

// ── HELPERS ───────────────────────────────────────────────────────────────
function _parseDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  const d = new Date(String(val));
  return isNaN(d.getTime()) ? null : d;
}

function _parseNum(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(String(val).replace(/[,\s]/g, ''));
  return isNaN(n) ? null : n;
}

export default {
  extractOrderIds,
  detectStream,
  detectStage,
  buildOrderFlow,
  analyzeStreamRisk,
  ORDER_PATTERNS,
  STREAM_CONFIG,
};
