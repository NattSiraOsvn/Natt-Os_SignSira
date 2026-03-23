/**
 * NATT-OS Smart Get Data Engine v1.0
 * Tâm Luxury — Phát Hiện Thao Túng Luồng Sản Xuất
 *
 * 5 lớp bảo vệ:
 * L1 — Cross-Validate: đối chiếu đầu vào/đầu ra giữa các tổ
 * L2 — Anomaly Detect: số quá tròn, quá khớp, bất thường
 * L3 — Timestamp Audit: xem khi nào dữ liệu được nhập/sửa
 * L4 — Delta History: so sánh thay đổi theo thời gian
 * L5 — Baseline Compare: đối chiếu với định mức ấn định
 */

const SmartGetData = (() => {
'use strict';

// ── CẤU HÌNH BASELINE (ngưỡng hao hụt định mức từ nattos-loss-thresholds.js) ─
const BASELINE = {
  CASTING:       { max: 1.8, critical: 2.7 },  // Tổ Đúc
  COLD_WORK:     { max: 2.5, critical: 3.75 }, // Tổ Nguội
  STONE_SETTING: { max: 0.5, critical: 0.75 }, // Tổ Hột
  FINISHING:     { max: 0.3, critical: 0.45 }, // Nhám
  TOTAL:         { max: 4.9, critical: 7.0  }, // Toàn luồng (nhẫn nam)
};

// ── L2: ANOMALY PATTERNS ──────────────────────────────────────────────────────
const ANOMALY_PATTERNS = {
  // Số tròn đáng ngờ (vàng không bao giờ tròn chẵn chục)
  TOO_ROUND: (v) => {
    if (!v || typeof v !== 'number') return false;
    return v >= 10 && v % 5 === 0 && v % 0.05 < 0.001;
  },

  // Hao hụt luôn bằng đúng ngưỡng max (quá "đúng" = nghi ngờ)
  EXACTLY_AT_LIMIT: (pct, stage) => {
    const b = BASELINE[stage];
    if (!b) return false;
    return Math.abs(pct - b.max) < 0.01;
  },

  // Số cuối kỳ = đúng số đầu kỳ - hao hụt (không sai 1 ly = nghi ngờ nhập tay)
  PERFECT_MATCH: (input, output, loss) => {
    if (!input || !output) return false;
    const expected = input - (input * loss / 100);
    return Math.abs(output - expected) < 0.001;
  },

  // Nhập liệu cùng 1 thời điểm (cả tổ nhập 1 lúc = dàn dựng)
  BATCH_ENTRY: (timestamps) => {
    if (!timestamps || timestamps.length < 2) return false;
    const sorted = [...timestamps].sort();
    const gaps = sorted.slice(1).map((t,i) => t - sorted[i]);
    return gaps.some(g => g < 60000); // < 1 phút giữa các dòng
  },

  // Số liệu không thay đổi qua nhiều ngày (copy-paste)
  FROZEN_DATA: (history) => {
    if (!history || history.length < 3) return false;
    const vals = history.map(h => JSON.stringify(h.values));
    return vals.every(v => v === vals[0]);
  },

  // Tỷ lệ hao hụt quá đều qua các đơn hàng (không tự nhiên)
  TOO_CONSISTENT: (losses) => {
    if (!losses || losses.length < 5) return false;
    const mean = losses.reduce((s,v)=>s+v,0)/losses.length;
    const variance = losses.reduce((s,v)=>s+Math.pow(v-mean,2),0)/losses.length;
    return variance < 0.01; // std dev < 0.1% — quá đều
  },
};

// ── L1: CROSS VALIDATE ────────────────────────────────────────────────────────
function crossValidate(sheetRows) {
  /**
   * Mỗi đơn hàng phải thỏa:
   * - Kho xuất = Tổ Đúc nhận (chính xác đến 0.001 chỉ)
   * - Tổ Đúc xuất = Tổ Nguội nhận
   * - Tổ Nguội xuất = Tổ Hột nhận
   * - Tổ Hột xuất = Nhám nhận
   * - Nhám xuất = Kho thành phẩm nhận
   * Nếu bất kỳ link nào không khớp → FLAG
   */
  const issues = [];

  for (const row of sheetRows) {
    const orderId = row.orderId || row[0];

    // Kiểm tra chuỗi chuyển giao
    const chain = [
      { from: 'Kho Xuất',       val: parseNum(row.khoXuat),     key: 'kho_xuat' },
      { from: 'Đúc Nhận',       val: parseNum(row.ducNhan),     key: 'duc_nhan' },
      { from: 'Đúc Xuất',       val: parseNum(row.ducXuat),     key: 'duc_xuat' },
      { from: 'Nguội Nhận',     val: parseNum(row.nguoiNhan),   key: 'nguoi_nhan' },
      { from: 'Nguội Xuất',     val: parseNum(row.nguoiXuat),   key: 'nguoi_xuat' },
      { from: 'Hột Nhận',       val: parseNum(row.hotNhan),     key: 'hot_nhan' },
      { from: 'Hột Xuất',       val: parseNum(row.hotXuat),     key: 'hot_xuat' },
      { from: 'Nhám Nhận',      val: parseNum(row.nhamNhan),    key: 'nham_nhan' },
      { from: 'TP Nhận (Kho)',  val: parseNum(row.tpNhan),      key: 'tp_nhan' },
    ];

    // Kiểm tra handoff points (Xuất của A = Nhận của B)
    const handoffs = [
      ['Kho Xuất',   'Đúc Nhận',   'kho_xuat',   'duc_nhan'  ],
      ['Đúc Xuất',   'Nguội Nhận', 'duc_xuat',   'nguoi_nhan'],
      ['Nguội Xuất', 'Hột Nhận',   'nguoi_xuat', 'hot_nhan'  ],
      ['Hột Xuất',   'Nhám Nhận',  'hot_xuat',   'nham_nhan' ],
    ];

    for (const [fromName, toName, fromKey, toKey] of handoffs) {
      const fromVal = parseNum(row[fromKey]);
      const toVal   = parseNum(row[toKey]);
      if (fromVal > 0 && toVal > 0 && Math.abs(fromVal - toVal) > 0.005) {
        const diff = fromVal - toVal;
        issues.push({
          orderId, level: diff > 0.05 ? 'CRITICAL' : 'WARNING',
          type: 'HANDOFF_MISMATCH',
          message: `${fromName} (${fromVal}chi) ≠ ${toName} (${toVal}chi) — chênh ${diff.toFixed(3)}chi`,
          stage: toName, diff,
        });
      }
    }

    // Kiểm tra tổng hao hụt
    const khoXuat = parseNum(row.khoXuat);
    const tpNhan  = parseNum(row.tpNhan);
    if (khoXuat > 0 && tpNhan > 0) {
      const totalLoss = (khoXuat - tpNhan) / khoXuat * 100;
      if (totalLoss > BASELINE.TOTAL.critical) {
        issues.push({
          orderId, level: 'CRITICAL',
          type: 'TOTAL_LOSS_EXCEED',
          message: `Hao hụt tổng ${totalLoss.toFixed(2)}% vượt ngưỡng critical ${BASELINE.TOTAL.critical}%`,
          loss: totalLoss,
        });
      } else if (totalLoss > BASELINE.TOTAL.max) {
        issues.push({
          orderId, level: 'WARNING',
          type: 'TOTAL_LOSS_EXCEED',
          message: `Hao hụt tổng ${totalLoss.toFixed(2)}% vượt định mức ${BASELINE.TOTAL.max}%`,
          loss: totalLoss,
        });
      }
    }
  }

  return issues;
}

// ── L2: ANOMALY DETECT ────────────────────────────────────────────────────────
function detectAnomalies(sheetRows, history = []) {
  const flags = [];

  sheetRows.forEach((row, idx) => {
    const orderId = row.orderId || `ROW-${idx+2}`;

    // Check từng giá trị số
    Object.entries(row).forEach(([key, val]) => {
      const n = parseNum(val);
      if (n > 0 && ANOMALY_PATTERNS.TOO_ROUND(n)) {
        flags.push({
          orderId, level: 'SUSPICIOUS', type: 'ROUND_NUMBER',
          message: `${key} = ${n} (số tròn đáng ngờ — vàng thường không tròn chẵn)`,
          field: key, value: n,
        });
      }
    });

    // Check hao hụt các tổ
    const stageChecks = [
      { stage: 'CASTING',       pctKey: 'ducHaoHut'   },
      { stage: 'COLD_WORK',     pctKey: 'nguoiHaoHut' },
      { stage: 'STONE_SETTING', pctKey: 'hotHaoHut'   },
      { stage: 'FINISHING',     pctKey: 'nhamHaoHut'  },
    ];

    stageChecks.forEach(({ stage, pctKey }) => {
      const pct = parseNum(row[pctKey]);
      if (pct > 0 && ANOMALY_PATTERNS.EXACTLY_AT_LIMIT(pct, stage)) {
        flags.push({
          orderId, level: 'SUSPICIOUS', type: 'EXACTLY_AT_LIMIT',
          message: `${stage}: hao hụt ${pct}% = đúng ngưỡng max (nghi ngờ nhập đối phó)`,
          stage, value: pct,
        });
      }
    });
  });

  // Check consistency across multiple rows
  const lossPcts = sheetRows
    .map(r => parseNum(r.ducHaoHut))
    .filter(v => v > 0);
  if (ANOMALY_PATTERNS.TOO_CONSISTENT(lossPcts)) {
    flags.push({
      orderId: 'BATCH', level: 'WARNING', type: 'TOO_CONSISTENT',
      message: `Hao hụt Tổ Đúc quá đều qua ${lossPcts.length} đơn — có thể nhập tay cố định`,
      values: lossPcts.slice(0,5),
    });
  }

  // Check frozen data
  if (history.length > 2 && ANOMALY_PATTERNS.FROZEN_DATA(history)) {
    flags.push({
      orderId: 'ALL', level: 'WARNING', type: 'FROZEN_DATA',
      message: `Dữ liệu không thay đổi qua ${history.length} lần sync — có thể sheet bị đóng băng`,
    });
  }

  return flags;
}

// ── L3: TIMESTAMP AUDIT ───────────────────────────────────────────────────────
function auditTimestamps(rows) {
  /**
   * Google Sheets không expose edit timestamps qua API thông thường.
   * Ta dùng: so sánh thời điểm nhận data của ta với pattern nhập liệu
   * + Phát hiện batch entry (nhiều dòng nhập cùng lúc)
   */
  const flags = [];

  // Kiểm tra cột timestamp nếu có
  const tsRows = rows.filter(r => r.timestamp || r.ngayNhap || r.thoiGian);

  if (tsRows.length > 1) {
    const timestamps = tsRows.map(r => {
      const ts = r.timestamp || r.ngayNhap || r.thoiGian;
      return new Date(ts).getTime();
    }).filter(t => !isNaN(t));

    if (ANOMALY_PATTERNS.BATCH_ENTRY(timestamps)) {
      flags.push({
        level: 'WARNING', type: 'BATCH_ENTRY',
        message: `Phát hiện nhiều dòng được nhập trong < 1 phút — có thể copy-paste dàn dựng`,
        timestamps: timestamps.slice(0, 5),
      });
    }

    // Kiểm tra nhập ngoài giờ làm việc
    timestamps.forEach((ts, i) => {
      const d = new Date(ts);
      const h = d.getHours();
      if (h < 7 || h > 19) {
        flags.push({
          orderId: tsRows[i]?.orderId || `ROW-${i}`,
          level: 'SUSPICIOUS', type: 'OFF_HOURS_ENTRY',
          message: `Nhập liệu lúc ${d.toLocaleTimeString('vi-VN')} — ngoài giờ làm việc`,
          time: d.toISOString(),
        });
      }
    });
  }

  return flags;
}

// ── L4: DELTA HISTORY ─────────────────────────────────────────────────────────
function analyzeDelta(current, previous) {
  /**
   * So sánh snapshot hiện tại với snapshot trước
   * Phát hiện: dòng bị XÓA, số bị SỬA ngược, thêm dòng lạ
   */
  if (!previous || !previous.length) return { changes: [], flags: [] };

  const changes = [];
  const flags   = [];

  // Index by orderId
  const prevMap = {};
  previous.forEach(r => { if (r.orderId) prevMap[r.orderId] = r; });

  current.forEach(row => {
    const prev = prevMap[row.orderId];
    if (!prev) return; // dòng mới — bình thường

    // Kiểm tra số bị sửa
    const numericKeys = ['khoXuat','ducNhan','ducXuat','nguoiNhan','nguoiXuat','hotNhan','hotXuat','nhamNhan','tpNhan'];
    numericKeys.forEach(key => {
      const currVal = parseNum(row[key]);
      const prevVal = parseNum(prev[key]);
      if (prevVal > 0 && currVal > 0 && Math.abs(currVal - prevVal) > 0.001) {
        const diff = currVal - prevVal;
        const sign = diff > 0 ? '+' : '';
        changes.push({ orderId: row.orderId, field: key, prev: prevVal, curr: currVal, diff });

        // Số bị giảm = cực kỳ đáng ngờ
        if (diff < -0.01) {
          flags.push({
            orderId: row.orderId, level: 'CRITICAL', type: 'VALUE_DECREASED',
            message: `${key}: ${prevVal} → ${currVal} (${sign}${diff.toFixed(3)}chi) — SỐ BỊ GIẢM SAU KHI NHẬP`,
            field: key, prev: prevVal, curr: currVal, diff,
          });
        }
      }
    });
  });

  // Kiểm tra dòng bị xóa
  previous.forEach(prev => {
    if (prev.orderId && !current.find(r => r.orderId === prev.orderId)) {
      flags.push({
        orderId: prev.orderId, level: 'CRITICAL', type: 'ROW_DELETED',
        message: `Đơn ${prev.orderId} đã bị XÓA khỏi Sheet — yêu cầu giải trình`,
        deletedData: prev,
      });
    }
  });

  return { changes, flags };
}

// ── L5: BASELINE COMPARE ──────────────────────────────────────────────────────
function compareBaseline(rows) {
  const report = { ok: [], warnings: [], criticals: [] };

  rows.forEach(row => {
    const orderId = row.orderId || '?';
    const khoXuat = parseNum(row.khoXuat);
    if (!khoXuat) return;

    const stages = [
      { key: 'ducXuat',   intake: 'ducNhan',   name: 'Tổ Đúc',   stage: 'CASTING' },
      { key: 'nguoiXuat', intake: 'nguoiNhan', name: 'Tổ Nguội', stage: 'COLD_WORK' },
      { key: 'hotXuat',   intake: 'hotNhan',   name: 'Tổ Hột',   stage: 'STONE_SETTING' },
      { key: 'nhamNhan',  intake: 'nhamNhan',  name: 'Nhám',     stage: 'FINISHING' },
    ];

    stages.forEach(({ key, intake, name, stage }) => {
      const recv = parseNum(row[intake]);
      const send = parseNum(row[key]);
      if (!recv || !send) return;

      const lossPct = (recv - send) / recv * 100;
      const baseline = BASELINE[stage];
      const entry = { orderId, stage: name, loss: lossPct, baseline: baseline.max };

      if (lossPct > baseline.critical) {
        report.criticals.push({ ...entry, level: 'CRITICAL',
          message: `${name}: ${lossPct.toFixed(2)}% > critical ${baseline.critical}%` });
      } else if (lossPct > baseline.max) {
        report.warnings.push({ ...entry, level: 'WARNING',
          message: `${name}: ${lossPct.toFixed(2)}% > định mức ${baseline.max}%` });
      } else if (lossPct < 0.1 && recv > 0.5) {
        // Hao hụt quá thấp cũng đáng ngờ (= không khai đủ)
        report.warnings.push({ ...entry, level: 'SUSPICIOUS',
          message: `${name}: ${lossPct.toFixed(2)}% — thấp bất thường (có thể chưa khai đủ)` });
      } else {
        report.ok.push(entry);
      }
    });
  });

  return report;
}

// ── MAIN: FULL SMART ANALYSIS ─────────────────────────────────────────────────
function analyze(rawRows, options = {}) {
  const { history = [], previousSnapshot = null } = options;

  // Parse raw Sheets data → structured rows
  const rows = parseSheetRows(rawRows);

  // Run all 5 layers
  const l1 = crossValidate(rows);
  const l2 = detectAnomalies(rows, history);
  const l3 = auditTimestamps(rows);
  const l4 = previousSnapshot ? analyzeDelta(rows, previousSnapshot) : { changes: [], flags: [] };
  const l5 = compareBaseline(rows);

  const allIssues = [
    ...l1.map(i => ({ ...i, layer: 'L1-CrossValidate' })),
    ...l2.map(i => ({ ...i, layer: 'L2-Anomaly' })),
    ...l3.map(i => ({ ...i, layer: 'L3-Timestamp' })),
    ...l4.flags.map(i => ({ ...i, layer: 'L4-Delta' })),
  ];

  const criticals  = allIssues.filter(i => i.level === 'CRITICAL');
  const warnings   = allIssues.filter(i => i.level === 'WARNING');
  const suspicious = allIssues.filter(i => i.level === 'SUSPICIOUS');

  // Risk score 0-100
  const riskScore = Math.min(100,
    criticals.length  * 25 +
    warnings.length   * 10 +
    suspicious.length * 5  +
    l5.criticals.length * 20 +
    l5.warnings.length  * 8
  );

  const riskLevel = riskScore >= 70 ? 'CRITICAL' :
                    riskScore >= 40 ? 'HIGH' :
                    riskScore >= 20 ? 'MEDIUM' : 'LOW';

  return {
    timestamp:    new Date().toISOString(),
    rowsAnalyzed: rows.length,
    riskScore,
    riskLevel,
    summary: {
      criticals:  criticals.length,
      warnings:   warnings.length,
      suspicious: suspicious.length,
      deltaChanges: l4.changes.length,
    },
    issues: {
      critical:  criticals,
      warning:   warnings,
      suspicious,
    },
    layers: {
      l1_crossValidate: l1,
      l2_anomaly:       l2,
      l3_timestamp:     l3,
      l4_delta:         l4,
      l5_baseline:      l5,
    },
    dataIntegrity: {
      score:         100 - riskScore,
      deletedRows:   l4.flags.filter(f => f.type === 'BATCH_ENTRY').length,
      modifiedRows:  l4.changes.length,
      batchEntries:  l3.filter ? l3.filter(f => f.type === 'BATCH_ENTRY').length : 0,
    },
  };
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const s = String(val).replace(/[,\s]/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}


// ══════════════════════════════════════════════════════════════════
// SMART HEADER DETECTION — Port từ JustU v9.0
// Tự động tìm header row thật khi sheet có title/merge rows phía trên
// (Luồng SX sheet: header ở row 4-6, không phải row 1)
// ══════════════════════════════════════════════════════════════════

// Keyword scoring cho header detection
const HEADER_KW = [
  {kw:'mã đơn',s:10},{kw:'order id',s:10},{kw:'mã hàng',s:9},{kw:'mã sp',s:8},
  {kw:'láp',s:8},{kw:'số phiếu',s:8},{kw:'mã chính thức',s:8},
  {kw:'ngày',s:7},{kw:'date',s:7},{kw:'thời gian',s:6},
  {kw:'trọng lượng',s:7},{kw:'vàng',s:6},{kw:'màu',s:5},{kw:'tuổi',s:5},
  {kw:'đá',s:5},{kw:'trạng thái',s:6},{kw:'số lượng',s:6},
  {kw:'khách hàng',s:7},{kw:'tên hàng',s:6},{kw:'giá',s:5},
  {kw:'thợ',s:5},{kw:'người nhận',s:5},{kw:'ghi chú',s:4},
  {kw:'tổng',s:5},{kw:'size',s:4},{kw:'loại',s:5},{kw:'phân loại',s:5},
  // Luồng SX specific
  {kw:'họ và tên',s:9},{kw:'luồng hàng',s:9},{kw:'bột',s:7},
  {kw:'ca làm việc',s:7},{kw:'chêch lệch',s:7},{kw:'bột thu',s:8},
  {kw:'tháng',s:5},{kw:'chủng loại',s:6},{kw:'mã thợ',s:8},
  {kw:'công đoạn',s:8},{kw:'trạng thái',s:6},{kw:'phát sinh',s:5},
  {kw:'định mức',s:6},{kw:'nguồn liệu',s:7},{kw:'tuổi vàng',s:8},
];

/**
 * Tính điểm cho 1 row — row nào điểm cao nhất = header
 */
function _scoreHeaderRow(row) {
  let score = 0, nonEmpty = 0, shortStr = 0;
  row.forEach(cell => {
    if (cell == null || cell === '') return;
    nonEmpty++;
    const s = String(cell).trim();
    if (!s) return;
    // Ngắn + không phải số = có khả năng là header
    if (s.length < 40 && isNaN(s)) { shortStr++; score += 1; }
    // Nếu cell là mã đơn → không phải header
    if (/\b(CT|KD|KB)\d{2}-\d{3,6}\b/i.test(s)) score -= 15;
    // Nếu là Date object → không phải header
    if (cell instanceof Date) score -= 5;
    // Nếu là số thuần → không phải header
    if (typeof cell === 'number') score -= 3;
    // Keyword matching
    const low = s.toLowerCase();
    HEADER_KW.forEach(({kw, s: ks}) => { if (low.includes(kw)) score += ks; });
  });
  if (nonEmpty < 2) return -100;
  score += (shortStr / Math.max(nonEmpty, 1)) * 10;
  return score;
}

/**
 * findHeaderRow(rawRows, maxScan=10)
 * Trả về: { headerRowIndex, headers, dataStartIndex, score }
 *
 * VD: Sheet Cân Hàng Ngày — rows 0-3 là title/merge
 *     Row 4 = ['THÁNG','NGÀY','HỌ VÀ TÊN','LUỒNG HÀNG',...]  ← header thật
 *     → trả về { headerRowIndex: 4, dataStartIndex: 5 }
 */
function findHeaderRow(rawRows, maxScan = 12) {
  if (!rawRows || rawRows.length < 2) return { headerRowIndex: 0, headers: [], dataStartIndex: 1, score: 0 };

  const limit = Math.min(maxScan, rawRows.length);
  let bestIdx = 0, bestScore = -Infinity;

  for (let i = 0; i < limit; i++) {
    const s = _scoreHeaderRow(rawRows[i]);
    if (s > bestScore) { bestScore = s; bestIdx = i; }
  }

  // Nếu score quá thấp → fallback về row 0
  if (bestScore < 3) bestIdx = 0;

  const headers = rawRows[bestIdx].map(h => String(h || '').trim());

  return {
    headerRowIndex: bestIdx,
    headers,
    dataStartIndex: bestIdx + 1,
    score: bestScore,
  };
}

// ══════════════════════════════════════════════════════════════════
// ORDER ID DETECTION — Port từ JustU v9.0 + MEGA v10.1
// Phân luồng tự động: CT25/KD25/KB25 → SX_CHINH/SX_PHU/BAO_HANH
// ══════════════════════════════════════════════════════════════════

const ORDER_PATTERNS = [
  { regex: /\bCT\d{2}-\d{4,6}\b/gi, prefix: 'CT', stream: 'SX_CHINH',  label: 'Chế Tác'        },
  { regex: /\bKD\d{2}-\d{4,6}\b/gi, prefix: 'KD', stream: 'SX_PHU',    label: 'Kinh Doanh'     },
  { regex: /\bKB\d{2}-\d{4,6}\b/gi, prefix: 'KB', stream: 'BAO_HANH',  label: 'Kho Bảo Hành'  },
  { regex: /\bVC\d{4,6}\b/gi,         prefix: 'VC', stream: 'SHOWROOM',  label: 'Vỉ Chưng / SR' },
  { regex: /\b28\d{3}\b/gi,            prefix: '28', stream: 'SC_BH_KB',  label: 'Sửa Chữa'      },
];

const STREAM_CONFIG = {
  SX_CHINH: { group: 'STREAM_A', color: '#1c4587', priority: 1 },
  SX_PHU:   { group: 'STREAM_A', color: '#1c4587', priority: 2 },
  BAO_HANH: { group: 'STREAM_B', color: '#4c1130', priority: 3 },
  SHOWROOM: { group: 'STREAM_B', color: '#4c1130', priority: 4 },
  SC_BH_KB: { group: 'STREAM_B', color: '#4c1130', priority: 5 },
  UNKNOWN:  { group: 'UNKNOWN',  color: '#999999', priority: 9 },
};

/**
 * extractOrderIds(text)
 * VD: "CT25-6429 giao ngày 3/1" → [{id:'CT25-6429', prefix:'CT', stream:'SX_CHINH'}]
 */
function extractOrderIds(text) {
  if (!text) return [];
  const str = String(text);
  const out = [];
  const seen = new Set();
  ORDER_PATTERNS.forEach(p => {
    p.regex.lastIndex = 0;
    let m;
    while ((m = p.regex.exec(str)) !== null) {
      const id = m[0].toUpperCase();
      if (!seen.has(id)) {
        seen.add(id);
        out.push({ id, prefix: p.prefix, stream: p.stream, label: p.label });
      }
    }
  });
  return out;
}

/**
 * detectStreamFromRow(rowObj, sheetName)
 * Tìm luồng từ values trong row, fallback theo tên sheet
 */
function detectStreamFromRow(rowObj, sheetName) {
  // Quét tất cả values trong row
  for (const val of Object.values(rowObj || {})) {
    const ids = extractOrderIds(val);
    if (ids.length > 0) {
      return {
        stream: ids[0].stream,
        orderId: ids[0].id,
        allIds: ids.map(x => x.id),
        label: ids[0].label,
      };
    }
  }
  // Fallback theo tên sheet
  const low = String(sheetName || '').toLowerCase();
  if (/bảo hành|warranty|bh/.test(low))          return { stream: 'BAO_HANH', orderId: null, allIds: [] };
  if (/showroom|sr|trưng bày/.test(low))         return { stream: 'SHOWROOM', orderId: null, allIds: [] };
  if (/sx|sản xuất|chế tác|đúc|phôi/.test(low))  return { stream: 'SX_CHINH', orderId: null, allIds: [] };
  if (/kd|kinh doanh|bán hàng|sale/.test(low))   return { stream: 'SX_PHU',   orderId: null, allIds: [] };
  if (/sửa chữa|sc-bh|28\d{3}/.test(low))       return { stream: 'SC_BH_KB', orderId: null, allIds: [] };
  return { stream: 'UNKNOWN', orderId: null, allIds: [] };
}

/**
 * detectStageFromSheetName(sheetName)
 * Auto-detect công đoạn SX từ tên sheet — Port từ JustU _detectStage()
 */
function detectStageFromSheetName(sheetName) {
  const low = String(sheetName || '').toLowerCase();
  if (/order|đơn hàng|bán hàng|sale|kd/.test(low))           return '1-Order';
  if (/3d|thiết kế|design|mẫu/.test(low))                    return '2-Design';
  if (/sáp|wax|rubber/.test(low))                            return '3-Sáp';
  if (/đúc|casting|phôi/.test(low))                          return '4-Đúc';
  if (/láp|assembly|ráp/.test(low))                          return '5-Láp';
  if (/hột|stone|đá tấm/.test(low))                          return '6-Gắn đá';
  if (/nhám|đánh bóng|polish|hoàn thiện|finish/.test(low))   return '7-Nhám';
  if (/xi|mạ|plate/.test(low))                               return '8-Xi';
  if (/kiểm tra|qc|quality/.test(low))                       return '9-QC';
  if (/xuất xưởng|giao hàng|vận đơn|shipping/.test(low))     return '10-Xuất';
  if (/bảo hành|warranty|sửa chữa|repair/.test(low))         return 'BH-Bảo hành';
  if (/showroom|trưng bày|sr/.test(low))                     return 'SR-Showroom';
  if (/cân hàng|bột thu/.test(low))                          return 'SX-CânBột';
  if (/cân nguyên liệu|vật tư/.test(low))                    return 'SX-NLPhụ';
  if (/giao nhận thợ|phát hàng/.test(low))                   return 'SX-GiaoNhận';
  if (/phân kim|nấu heo/.test(low))                          return 'SX-PhânKim';
  return 'Other';
}


function parseSheetRows(rawRows, options = {}) {
  /**
   * Tự động map cột từ Google Sheets
   * UPGRADED: dùng findHeaderRow() thay vì assume row 0 = header
   * Hỗ trợ sheet có title rows (Luồng SX header ở row 4-6)
   */
  if (!rawRows || rawRows.length < 2) return [];

  const { sheetName = '', maxHeaderScan = 12 } = options;

  // Smart header detection
  const { headerRowIndex, headers, dataStartIndex } = findHeaderRow(rawRows, maxHeaderScan);
  const fieldMap = buildFieldMap(headers);
  const stage = detectStageFromSheetName(sheetName);

  return rawRows.slice(dataStartIndex)
    .filter(r => r.some(c => c !== null && c !== undefined && c !== ''))
    .map((row, idx) => {
      const obj = {
        _rowIndex: dataStartIndex + idx + 1,
        _headerRow: headerRowIndex + 1,
        _stage: stage,
      };
      headers.forEach((h, i) => {
        const field = fieldMap[i] || h;
        if (field) obj[field] = row[i] ?? '';
      });
      // Detect stream từ row
      const streamInfo = detectStreamFromRow(obj, sheetName);
      obj._stream  = streamInfo.stream;
      obj._orderId = streamInfo.orderId;
      obj._allIds  = streamInfo.allIds;
      return obj;
    });
}

function buildFieldMap(headers) {
  const map = {};
  const KNOWN_HEADERS = {
    // Mã đơn
    'mã đơn': 'orderId', 'ma don': 'orderId', 'order id': 'orderId',
    'số đơn': 'orderId', 'đơn hàng': 'orderId',
    // Kho xuất
    'kho xuất': 'khoXuat', 'kho xuat': 'khoXuat', 'vàng xuất': 'khoXuat',
    'nhận từ kho': 'khoXuat', 'tổng nhận': 'khoXuat',
    // Đúc
    'đúc nhận': 'ducNhan', 'duc nhan': 'ducNhan',
    'đúc xuất': 'ducXuat', 'duc xuat': 'ducXuat',
    'đúc hh': 'ducHaoHut', 'hao hụt đúc': 'ducHaoHut', 'hh đúc': 'ducHaoHut',
    // Nguội
    'nguội nhận': 'nguoiNhan', 'nguoi nhan': 'nguoiNhan',
    'nguội xuất': 'nguoiXuat', 'nguoi xuat': 'nguoiXuat',
    'hao hụt nguội': 'nguoiHaoHut', 'hh nguội': 'nguoiHaoHut',
    // Hột
    'hột nhận': 'hotNhan', 'hot nhan': 'hotNhan', 'hột nhận': 'hotNhan',
    'hột xuất': 'hotXuat', 'hot xuat': 'hotXuat',
    'hao hụt hột': 'hotHaoHut',
    // Nhám
    'nhám nhận': 'nhamNhan', 'nham nhan': 'nhamNhan',
    'nhám xuất': 'nhamXuat',
    'hao hụt nhám': 'nhamHaoHut',
    // Thành phẩm
    'tp nhận': 'tpNhan', 'thành phẩm': 'tpNhan', 'kho nhận': 'tpNhan',
    'hoàn thành': 'tpNhan',
    // Timestamp
    'ngày': 'timestamp', 'thời gian': 'timestamp', 'date': 'timestamp',
    'nhập ngày': 'timestamp',
    // Nhân sự
    'người đúc': 'workerCasting', 'thợ đúc': 'workerCasting',
    'người nguội': 'workerCold', 'thợ nguội': 'workerCold',
  };

  headers.forEach((h, i) => {
    const lower = (h || '').toLowerCase().trim();
    const mapped = KNOWN_HEADERS[lower];
    if (mapped) map[i] = mapped;
  });

  return map;
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────
return { analyze, crossValidate, detectAnomalies, auditTimestamps, analyzeDelta, compareBaseline, parseSheetRows, buildFieldMap, findHeaderRow, extractOrderIds, detectStreamFromRow, detectStageFromSheetName, ORDER_PATTERNS, STREAM_CONFIG, BASELINE };

})();

// ── EXPORT (Node.js + Browser) ────────────────────────────────────────────────
if (typeof module !== 'undefined') module.exports = SmartGetData;
if (typeof window !== 'undefined') window.SmartGetData = SmartGetData;
