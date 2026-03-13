/**
 * pho-guard.engine.ts
 * 
 * Engine phát hiện thợ trả bụi rác giữ vàng sạch.
 * Chạy khi DUST_SMELTED event (sau nấu bụi hàng tháng).
 * 
 * Chặn: LĐ-4 (PHỔ thấp), LĐ-5 (vảy hàn rò rỉ)
 * 
 * Evidence: Trần Hoài Phúc SC PHỔ=49.88% vs SX PHỔ=74.06%
 *           Nguyễn Văn Vẹn giữ 3.95 chỉ NL phụ/tháng
 */

import type { PhoBenchmarkRecord, PhoFlag, SolderPhoBenchmark } from "../entities/pho-benchmark.entity";
import { PHO_FLAGS, SOLDER_PHO_EXPECTED } from "../entities/pho-benchmark.entity";

// ═══════════ CONFIG ═══════════
const PHO_CONFIG = {
  /** PHỔ dưới 70% → WARN */
  warnThreshold: 70,
  /** PHỔ dưới 60% → BLOCK + báo Gatekeeper */
  blockThreshold: 60,
  /** PHỔ SC < 50% → pattern Trần Hoài Phúc */
  scCriticalThreshold: 50,
  /** Chênh lệch PHỔ SX vs SC > 10 điểm % → flag */
  sxScDeltaThreshold: 10,
};

export interface PhoGuardResult {
  record: PhoBenchmarkRecord;
  flags: PhoFlag[];
  blocked: boolean;
  blockReason?: string;
}

/**
 * Validate 1 PHỔ record sau khi nấu bụi
 */
export function validatePhoRecord(record: PhoBenchmarkRecord): PhoGuardResult {
  const flags: PhoFlag[] = [];

  if (!record.afterSmelt) {
    return { record, flags: [], blocked: false };
  }

  const pho = record.afterSmelt.phoPercent;

  // ── PHỔ < 70% ──
  if (pho < PHO_CONFIG.warnThreshold && pho >= PHO_CONFIG.blockThreshold) {
    flags.push({
      code: PHO_FLAGS.PHO_BELOW_70,
      severity: "WARN",
      message: `PHỔ ${pho}% thấp hơn chuẩn 75%. Thợ: ${record.workerName}, luồng: ${record.stream}, kỳ: ${record.period}.`,
    });
  }

  // ── PHỔ < 60% → BLOCK ──
  if (pho < PHO_CONFIG.blockThreshold) {
    flags.push({
      code: PHO_FLAGS.PHO_BELOW_60,
      severity: "CRITICAL",
      message: `⛔ PHỔ ${pho}% CỰC THẤP. Thợ ${record.workerName} có dấu hiệu trả bụi rác. YÊU CẦU Gatekeeper xác nhận.`,
    });
  }

  // ── PHỔ SC < 50% → Trần Hoài Phúc pattern ──
  if (record.stream === "SC-BH-KB" && pho < PHO_CONFIG.scCriticalThreshold) {
    flags.push({
      code: PHO_FLAGS.PHO_SC_BELOW_50,
      severity: "CRITICAL",
      message: `⛔ PHỔ SC = ${pho}% (< 50%). GẦN NỬA BỤI LÀ TẠP CHẤT. Thợ: ${record.workerName}. Pattern: trả rác giữ vàng sạch.`,
    });
  }

  const blocked = flags.some(f => f.severity === "CRITICAL");

  return {
    record: { ...record, flags, status: blocked ? "FLAGGED" : record.status },
    flags,
    blocked,
    blockReason: blocked ? `BLOCKED: PHỔ ${pho}% — ${flags.filter(f => f.severity === "CRITICAL").map(f => f.code).join(", ")}` : undefined,
  };
}

/**
 * So sánh PHỔ SX vs SC cùng thợ cùng kỳ
 * LĐ-4: Nếu SC thấp hơn SX nhiều → trả rác ở SC, giữ vàng SX
 */
export function compareSxScPho(
  sxRecord: PhoBenchmarkRecord,
  scRecord: PhoBenchmarkRecord
): PhoFlag[] {
  const flags: PhoFlag[] = [];

  if (!sxRecord.afterSmelt || !scRecord.afterSmelt) return flags;
  if (sxRecord.workerId !== scRecord.workerId) return flags;

  const delta = sxRecord.afterSmelt.phoPercent - scRecord.afterSmelt.phoPercent;

  if (delta > PHO_CONFIG.sxScDeltaThreshold) {
    flags.push({
      code: PHO_FLAGS.PHO_SC_LOWER_THAN_SX,
      severity: "CRITICAL",
      message: `PHỔ SX=${sxRecord.afterSmelt.phoPercent}% vs SC=${scRecord.afterSmelt.phoPercent}% (chênh ${delta.toFixed(1)} điểm). Thợ ${sxRecord.workerName} trả bụi tốt ở SX, bụi rác ở SC.`,
    });
  }

  return flags;
}

/**
 * Validate PHỔ vảy hàn theo tháng
 * LĐ-5: PHỔ vảy hàn ổn định = hệ thống, không phải sự cố
 */
export function validateSolderPho(benchmark: SolderPhoBenchmark): PhoFlag[] {
  const flags: PhoFlag[] = [];
  const checks: Array<{ type: string; value: number; range: { min: number; max: number } }> = [
    { type: "VH_NHE", value: benchmark.vhNhePho, range: SOLDER_PHO_EXPECTED["VH_NHE"] },
    { type: "VH_NANG", value: benchmark.vhNangPho, range: SOLDER_PHO_EXPECTED["VH_NANG"] },
    { type: "VH_DO", value: benchmark.vhDoPho, range: SOLDER_PHO_EXPECTED["VH_DO"] },
  ];

  for (const c of checks) {
    if (c.value < c.range.min || c.value > c.range.max) {
      flags.push({
        code: PHO_FLAGS.SOLDER_PHO_ANOMALY,
        severity: "WARN",
        message: `Vảy hàn ${c.type} PHỔ=${c.value}% ngoài khoảng kỳ vọng [${c.range.min}-${c.range.max}%]. Kỳ: ${benchmark.period}.`,
      });
    }
  }

  return flags;
}

/**
 * NL phụ retain tracker — per thợ per tháng
 * LĐ-5: Nguyễn Văn Vẹn giữ 3.95 chỉ/tháng
 */
export interface MaterialRetainSummary {
  workerId: string;
  workerName: string;
  period: string;
  items: Array<{
    materialType: string;
    issued: number;       // TL giao (chỉ)
    returned: number;     // TL trả (chỉ)
    retained: number;     // giao - trả
    quy750: number;       // retained × tuổi / 75
  }>;
  totalRetainedChi: number;
  totalRetainedQuy750: number;
  estimatedLossVND: number;    // × giá vàng
}

export function computeMaterialRetain(
  summary: MaterialRetainSummary,
  goldPricePerChi: number = 8_000_000
): MaterialRetainSummary {
  summary.totalRetainedChi = summary.items.reduce((s, i) => s + i.retained, 0);
  summary.totalRetainedQuy750 = summary.items.reduce((s, i) => s + i.quy750, 0);
  summary.estimatedLossVND = Math.round(summary.totalRetainedQuy750 * goldPricePerChi);
  return summary;
}
