/**
 * weight-guard.engine.ts
 * 
 * Engine chặn thất thoát vàng tại công đoạn cân giao/nhận.
 * Chạy mỗi khi có WEIGH_IN hoặc WEIGH_OUT event.
 * 
 * Chặn: LĐ-1, LĐ-2, LĐ-3, LĐ-4, LĐ-5
 */

import type {
  WorkshopWeightRecord, WeightFlag, WorkStream, MaterialIssue
} from "../../../audit-cell/domain/entities/workshop-weight.entity";
import { WEIGHT_FLAGS } from "../../../audit-cell/domain/entities/workshop-weight.entity";

// ═══════════ CONFIG ═══════════
const CONFIG = {
  /** Chênh lệch TL cho phép (chỉ) — vượt = flag */
  maxVarianceChi: 0.05,
  /** NL phụ tối đa per đơn (chỉ) — vượt = flag */
  maxMaterialPerOrder: 0.5,
  /** SC mà TL tăng > threshold = flag WF-002 */
  scWeightIncreaseThreshold: 0.01,
  /** Bột thu sổ sách vs thực tế chênh > threshold = flag WF-003 */
  dustBookVsActualThreshold: 0.05,
};

export interface WeightGuardResult {
  record: WorkshopWeightRecord;
  flags: WeightFlag[];
  blocked: boolean;
  blockReason?: string;
}

/**
 * Validate 1 record cân giao/nhận
 */
export function validateWeightRecord(record: WorkshopWeightRecord): WeightGuardResult {
  const flags: WeightFlag[] = [];
  const now = Date.now();

  // ── LĐ-1: SC không mã đơn rõ ──
  if (record.stream === "SC-BH-KB") {
    const hasProperCode = /^(CT|KD|KB)\d{2}-\d+/.test(record.orderId);
    if (!hasProperCode) {
      flags.push({
        code: WEIGHT_FLAGS.SC_NO_ORDER_CODE,
        severity: "WARN",
        message: `Đơn SC [${record.orderId}] không có mã chuẩn (CT/KD/KB). Cần mã đơn gốc + lý do sửa.`,
        timestamp: now,
      });
    }
  }

  // ── LĐ-4: NL phụ không PXK ──
  for (const mat of record.weightIn.materialsIssued) {
    if (!mat.pxkNumber) {
      flags.push({
        code: WEIGHT_FLAGS.MATERIAL_NO_PXK,
        severity: record.stream === "SX" ? "CRITICAL" : "WARN",
        message: `${mat.materialType} ${mat.weightChi} chỉ giao thợ ${record.workerName} KHÔNG CÓ PXK.`,
        timestamp: now,
      });
    }
  }

  // ── NL phụ > quota ──
  const totalMaterial = record.weightIn.materialsIssued.reduce((s, m) => s + m.weightChi, 0);
  if (totalMaterial > CONFIG.maxMaterialPerOrder) {
    flags.push({
      code: WEIGHT_FLAGS.MATERIAL_OVER_QUOTA,
      severity: "WARN",
      message: `NL phụ ${totalMaterial.toFixed(3)} chỉ vượt định mức ${CONFIG.maxMaterialPerOrder} cho đơn ${record.orderId}.`,
      timestamp: now,
    });
  }

  // ── Nếu đã cân ra ──
  if (record.weightOut) {
    const variance = record.weightIn.totalIn - record.weightOut.totalOut;
    record.variance = variance;

    // ── LĐ-2: Vàng sinh ra ở SC ──
    if (record.stream === "SC-BH-KB" && variance < -CONFIG.scWeightIncreaseThreshold) {
      flags.push({
        code: WEIGHT_FLAGS.SC_WEIGHT_INCREASE,
        severity: "CRITICAL",
        message: `⚠️ SP sửa chữa TĂNG ${Math.abs(variance).toFixed(3)} chỉ. TL vào=${record.weightIn.totalIn}, TL ra=${record.weightOut.totalOut}. Vàng từ đâu?`,
        timestamp: now,
      });
    }

    // ── LĐ-6: Variance > limit ──
    if (Math.abs(variance) > CONFIG.maxVarianceChi) {
      flags.push({
        code: WEIGHT_FLAGS.VARIANCE_OVER_LIMIT,
        severity: variance > 0.2 ? "CRITICAL" : "WARN",
        message: `Chênh lệch ${variance.toFixed(3)} chỉ (${variance > 0 ? "mất" : "thừa"}) đơn ${record.orderId} thợ ${record.workerName}.`,
        timestamp: now,
      });
    }
  }

  // Block nếu có bất kỳ CRITICAL flag nào ở luồng SX
  const hasCritical = flags.some(f => f.severity === "CRITICAL");
  const blocked = hasCritical && record.stream === "SX";

  return {
    record: { ...record, flags, status: blocked ? "FLAGGED" : record.status },
    flags,
    blocked,
    blockReason: blocked ? `BLOCKED: ${flags.filter(f => f.severity === "CRITICAL").map(f => f.code).join(", ")}` : undefined,
  };
}

/**
 * Validate bột thu cuối ca: sổ sách vs thực tế
 * LĐ-3: Nguyễn Văn Quang — sổ sách 0.432, thực tế 0.298, mất 0.134
 */
export interface DustCollectionCheck {
  workerId: string;
  workerName: string;
  date: string;
  stream: WorkStream;
  dustBookValue: number;    // chênh lệch sổ sách trong ca
  dustActualValue: number;  // bột thu thực tế (cân)
}

export function validateDustCollection(check: DustCollectionCheck): WeightFlag[] {
  const flags: WeightFlag[] = [];
  const diff = check.dustBookValue - check.dustActualValue;

  if (diff > CONFIG.dustBookVsActualThreshold) {
    flags.push({
      code: WEIGHT_FLAGS.DUST_BOOK_GT_ACTUAL,
      severity: diff > 0.1 ? "CRITICAL" : "WARN",
      message: `Bột thu sổ sách (${check.dustBookValue.toFixed(3)}) > thực tế (${check.dustActualValue.toFixed(3)}), mất ${diff.toFixed(3)} chỉ. Thợ: ${check.workerName}, ngày ${check.date}.`,
      timestamp: Date.now(),
    });
  }

  return flags;
}

/**
 * Aggregate: tổng hợp per thợ per tháng → ranking
 */
export interface WorkerMonthlyScore {
  workerId: string;
  workerName: string;
  period: string;
  totalOrders: number;
  totalVarianceChi: number;
  totalDustLoss: number;
  totalMaterialRetained: number;
  flagCount: { INFO: number; WARN: number; CRITICAL: number; BLOCK: number };
  riskScore: number;         // 0-100, computed
}

export function computeRiskScore(score: WorkerMonthlyScore): number {
  const w = {
    variance: 30,    // chênh lệch TL
    dustLoss: 25,    // bột mất
    material: 20,    // NL giữ lại
    criticals: 25,   // số lần CRITICAL
  };

  const varianceScore = Math.min(score.totalVarianceChi / 2, 1) * w.variance;
  const dustScore = Math.min(score.totalDustLoss / 1, 1) * w.dustLoss;
  const materialScore = Math.min(score.totalMaterialRetained / 3, 1) * w.material;
  const criticalScore = Math.min(score.flagCount.CRITICAL / 5, 1) * w.criticals;

  return Math.round(varianceScore + dustScore + materialScore + criticalScore);
}
