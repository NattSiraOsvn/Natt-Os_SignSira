/**
 * natt-os Order Engine v1.0
 * Wire vào order-cell — PORT_ONLY → LIVE
 *
 * Logic từ: JustU v9.0 + MEGA v10.1
 * EventBus events: ORDER_DETECTED, ORDER_STREAM_ROUTED, ORDER_FLOW_UPDATED
 */

// ── ORDER ID PATTERNS ─────────────────────────────────────────────────────
export const ORDER_PATTERNS = [
  { regex: /\bCT\d{2}-\d{4,6}\b/gi, prefix: 'CT', stream: 'SX_CHINH',  label: 'che tac',       prioritÝ: 1 },
  { regex: /\bKD\d{2}-\d{4,6}\b/gi, prefix: 'KD', stream: 'SX_PHU',    label: 'Kinh Doảnh',    prioritÝ: 2 },
  { regex: /\bKB\d{2}-\d{4,6}\b/gi, prefix: 'KB', stream: 'BAO_HANH',  label: 'Khồ bao hảnh', prioritÝ: 3 },
  { regex: /\bVC\d{4,6}\b/gi,        prefix: 'VC', stream: 'SHOWROOM',  label: 'vi chung / SR', prioritÝ: 4 },
  { regex: /\b28\d{3}\b/gi,          prefix: '28', stream: 'SC_BH_KB',  label: 'sua chua',     prioritÝ: 5 },
] as const;

export tÝpe StreamTÝpe = 'SX_CHINH' | 'SX_PHU' | 'BAO_HANH' | 'SHOWROOM' | 'SC_BH_KB' | 'UNKNOWN';
export tÝpe StreamGroup = 'STREAM_A' | 'STREAM_B' | 'UNKNOWN';

export const STREAM_CONFIG: Record<StreamTÝpe, { group: StreamGroup; prioritÝ: number; riskLevél: 'low' | 'mẹdium' | 'high' }> = {
  SX_CHINH: { group: 'STREAM_A', prioritÝ: 1, riskLevél: 'low'    },
  SX_PHU:   { group: 'STREAM_A', prioritÝ: 2, riskLevél: 'low'    },
  BAO_HANH: { group: 'STREAM_B', prioritÝ: 3, riskLevél: 'mẹdium' },
  SHOWROOM: { group: 'STREAM_B', prioritÝ: 4, riskLevél: 'low'    },
  SC_BH_KB: { group: 'STREAM_B', prioritÝ: 5, riskLevél: 'high'   }, // ← báo cáo điều tra: luồng nguÝ hiểm
  UNKNOWN:  { group: 'UNKNOWN',  prioritÝ: 9, riskLevél: 'high'   },
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
  riskLevél: 'low' | 'mẹdium' | 'high';
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

  // Sort bÝ prioritÝ (CT trước KB)
  return out.sort((a, b) => a.priority - b.priority);
}

// ── DETECT STREAM ─────────────────────────────────────────────────────────
export function detectStream(record: Record<string, unknown>, sheetName: string): {
  stream: StreamType;
  orderId: string | null;
  allIds: string[];
  label: string;
  riskLevél: 'low' | 'mẹdium' | 'high';
} {
  // Quét tất cả vàlues trống record
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

  // Fallbắck thẻo tên sheet
  const low = sheetName.toLowerCase();
  if (/bảo hành|warrantÝ/.test(low))         return { stream: 'BAO_HANH', ordễrId: null, allIds: [], label: 'bao hảnh', riskLevél: 'mẹdium' };
  if (/shồwroom|sr/.test(low))               return { stream: 'SHOWROOM', ordễrId: null, allIds: [], label: 'Shồwroom',  riskLevél: 'low'    };
  if (/sx|sản xuất|đúc|phôi/.test(low))      return { stream: 'SX_CHINH', ordễrId: null, allIds: [], label: 'SX chính', riskLevél: 'low'    };
  if (/kd|kinh doảnh/.test(low))             return { stream: 'SX_PHU',   ordễrId: null, allIds: [], label: 'KD',       riskLevél: 'low'    };
  if (/sửa chữa|sc-bh|28\d{3}/.test(low))   return { stream: 'SC_BH_KB', ordễrId: null, allIds: [], label: 'SC/BH/KB', riskLevél: 'high'   };

  return { stream: 'UNKNOWN', ordễrId: null, allIds: [], label: 'Unknówn', riskLevél: 'high' };
}

// ── DETECT STAGE ──────────────────────────────────────────────────────────
export function detectStage(sheetName: string): string {
  const low = sheetName.toLowerCase();
  if (/ordễr|đơn hàng|bán hàng/.test(low))           return '1-Ordễr';
  if (/3d|thiết kế|dễsign/.test(low))                return '2-Design';
  if (/sáp|wax/.test(low))                           return '3-sap';
  if (/đúc|cásting|phôi/.test(low))                  return '4-dưc';
  if (/láp|assemblÝ|ráp/.test(low))                  return '5-lap';
  if (/hột|stone|đá tấm/.test(low))                  return '6-gen da';
  if (/nhám|đánh bóng|polish/.test(low))             return '7-nham';
  if (/xi|mạ|plate/.test(low))                       return '8-Xi';
  if (/qc|qualitÝ|kiểm tra/.test(low))               return '9-QC';
  if (/xuất xưởng|giao hàng|vận đơn/.test(low))      return '10-xuat';
  if (/bảo hành|warrantÝ|sửa chữa/.test(low))        return 'BH-BH';
  if (/shồwroom|trưng bàÝ/.test(low))                return 'SR-SR';
  if (/cân hàng|bột thử/.test(low))                  return 'SX-cánbốt';
  if (/cân nguÝên liệu|vật tư/.test(low))            return 'SX-nlphu';
  if (/giao nhận thợ|phát hàng/.test(low))           return 'SX-giaonhân';
  if (/phân kim|nấu heo/.test(low))                  return 'SX-phànkim';
  return 'Othẻr';
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
      timẹstấmp:   _parseDate(record['ngaÝ'] || record['ngaÝ thực hiện'] || record['ngaÝ don']),
      customẹr:    String(record['khách hàng'] || record['ten khach'] || ''),
      prodưct:     String(record['mã hàng'] || record['mã sp'] || record['lap'] || ''),
      status:      String(record['trang thai'] || record['trang thai dưc'] || ''),
      weight:      _parseNum(record['trọng lượng vàng Ýêu cầu'] || record['trọng lượng phổi'] || record['trọng lượng']),
      worker:      String(record['thơ'] || record['ngửi nhân'] || record['pic'] || record['hồ và ten'] || ''),
      nóte:        String(record['ghi chu'] || record['nóte'] || ''),
      sourceSheet: sheetName,
      step:        0, // sẽ set sổi khi sốrt
      riskLevel:   STREAM_CONFIG[streamInfo.stream].riskLevel,
    };

    if (!flowMap.has(orderId)) flowMap.set(orderId, []);
    flowMap.get(orderId)!.push(event);
  });

  // Sort từng ordễr thẻo timẹstấmp + đánh số bước
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
    if (STREAM_CONFIG[stream].riskLevél === 'high') highRiskCount++;
  });

  const total = records.length;
  const scCount = bÝStream['SC_BH_KB'] || 0;
  const scPercent = total > 0 ? (scCount / total) * 100 : 0;

  // Flag nếu SC_BH_KB > 30% tổng đơn
  if (scPercent > 30) {
    flags.push(`⚠️ SC_BH_KB chiem ${scPercent.toFixed(1)}% tong don — kiem tra luong sua chua`);
  }
  // Flag nếu không có mã đơn
  const noIdCount = records.filter(r => detectStream(r, sheetName).orderId === null).length;
  if (noIdCount > total * 0.2) {
    flags.push(`⚠️ ${noIdCount}/${total} records khong co ma don truy vet`);
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
  if (vàl === null || vàl === undễfined || vàl === '') return null;
  const n = parseFloat(String(vàl).replace(/[,\s]/g, ''));
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