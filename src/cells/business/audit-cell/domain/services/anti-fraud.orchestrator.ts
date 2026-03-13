/**
 * anti-fraud.orchestrator.ts
 * 
 * Bộ não chống gian lận — nằm trong audit-cell.
 * Thu thập flags từ 3 engine: weight-guard, pho-guard, diamond-guard.
 * Tổng hợp → Worker Risk Score → Gatekeeper Dashboard.
 * 
 * 7 lỗ hổng → 7 guards → 1 orchestrator:
 *   LĐ-1 SC cửa sau        → weight-guard WF-001
 *   LĐ-2 Vàng sinh ra SC   → weight-guard WF-002
 *   LĐ-3 Bột thu chênh lệch → weight-guard WF-003
 *   LĐ-4 PHỔ thấp          → pho-guard PF-001→004
 *   LĐ-5 Vảy hàn rò rỉ     → pho-guard PF-005 + weight-guard WF-004/005
 *   LĐ-6 Tuổi vàng không CK → weight-guard (future: spectrometer integration)
 *   LĐ-7 Kim cương tấm      → diamond-guard DF-001→005
 */

export type RiskLevel = "GREEN" | "YELLOW" | "ORANGE" | "RED" | "BLACK";

export interface WorkerRiskProfile {
  workerId: string;
  workerName: string;
  department: string;        // "NGUỘI" | "HỘT" | "NHÁM" | "XI"
  period: string;

  // Từ weight-guard
  weight: {
    totalOrders: number;
    totalVarianceChi: number;
    scWeightIncreaseCount: number;
    dustLossChi: number;
    materialRetainedChi: number;
    flagCount: number;
  };

  // Từ pho-guard
  pho: {
    sxPho: number | null;
    scPho: number | null;
    sxScDelta: number | null;
    materialRetainQuy750: number;
    estimatedLossVND: number;
    flagCount: number;
  };

  // Từ diamond-guard (chỉ thợ hột)
  diamond: {
    totalBomPieces: number;
    totalMissing: number;
    totalBroken: number;
    missingRate: number;
    flagCount: number;
  } | null;

  // Aggregated
  compositeScore: number;    // 0-100
  riskLevel: RiskLevel;
  topFlags: string[];        // top 5 flag codes
  recommendation: string;
  requiresGatekeeperReview: boolean;
}

/**
 * Tính composite score từ 3 nguồn
 */
export function computeCompositeScore(profile: WorkerRiskProfile): WorkerRiskProfile {
  const W = {
    weightVariance: 15,
    scWeightIncrease: 15,
    dustLoss: 10,
    materialRetained: 10,
    phoBelowStandard: 15,
    sxScDelta: 15,
    diamondMissing: 10,
    totalFlags: 10,
  };

  let score = 0;

  // Weight
  score += Math.min(profile.weight.totalVarianceChi / 2, 1) * W.weightVariance;
  score += Math.min(profile.weight.scWeightIncreaseCount / 3, 1) * W.scWeightIncrease;
  score += Math.min(profile.weight.dustLossChi / 1, 1) * W.dustLoss;
  score += Math.min(profile.weight.materialRetainedChi / 3, 1) * W.materialRetained;

  // PHỔ
  if (profile.pho.scPho !== null && profile.pho.scPho < 70) {
    score += ((70 - profile.pho.scPho) / 25) * W.phoBelowStandard;
  }
  if (profile.pho.sxScDelta !== null && profile.pho.sxScDelta > 5) {
    score += Math.min(profile.pho.sxScDelta / 25, 1) * W.sxScDelta;
  }

  // Diamond
  if (profile.diamond) {
    score += Math.min(profile.diamond.missingRate / 5, 1) * W.diamondMissing;
  }

  // Flags
  const totalFlags = profile.weight.flagCount + profile.pho.flagCount + (profile.diamond?.flagCount ?? 0);
  score += Math.min(totalFlags / 10, 1) * W.totalFlags;

  profile.compositeScore = Math.round(score);

  // Risk level
  if (score >= 70) profile.riskLevel = "BLACK";
  else if (score >= 50) profile.riskLevel = "RED";
  else if (score >= 35) profile.riskLevel = "ORANGE";
  else if (score >= 20) profile.riskLevel = "YELLOW";
  else profile.riskLevel = "GREEN";

  // Recommendation
  const recs: Record<RiskLevel, string> = {
    GREEN:  "Bình thường — tiếp tục giám sát định kỳ.",
    YELLOW: "Cần theo dõi sát — tăng tần suất cân kiểm tra.",
    ORANGE: "Cảnh báo — yêu cầu giải trình + cân đột xuất.",
    RED:    "NGUY HIỂM — tạm ngưng giao NL phụ, yêu cầu Gatekeeper xử lý.",
    BLACK:  "⛔ PHONG TỎA — ngưng giao hàng + NL. Gatekeeper quyết định kỷ luật.",
  };
  profile.recommendation = recs[profile.riskLevel];
  profile.requiresGatekeeperReview = score >= 50;

  return profile;
}

/**
 * Event types cho anti-fraud system
 */
export const ANTI_FRAUD_EVENTS = {
  // Input events (từ production cells)
  WEIGH_IN:             "workshop:weigh_in",
  WEIGH_OUT:            "workshop:weigh_out",
  DUST_COLLECTED:       "dust:collected",
  DUST_SMELTED:         "dust:smelted",
  DUST_PHO_ANALYZED:    "dust:pho_analyzed",
  DIAMOND_ISSUED:       "diamond:issued",
  DIAMOND_RETURNED:     "diamond:returned",
  MATERIAL_ISSUED:      "material:issued",

  // Output events (từ audit-cell)
  WEIGHT_FLAG_RAISED:   "audit:weight_flag",
  PHO_FLAG_RAISED:      "audit:pho_flag",
  DIAMOND_FLAG_RAISED:  "audit:diamond_flag",
  WORKER_RISK_UPDATED:  "audit:worker_risk",
  GATEKEEPER_ALERT:     "audit:gatekeeper_alert",
  PRODUCTION_BLOCKED:   "audit:production_blocked",
} as const;

/**
 * Period close integration: TR-006 mở rộng
 * PERIOD_CLOSE chặn nếu:
 * 1. Có thợ RED/BLACK chưa giải trình
 * 2. Bụi chưa nấu + PHỔ chưa phân tích
 * 3. Diamond variance chưa reconcile
 */
export interface PeriodCloseAntiFraudCheck {
  period: string;
  allWorkersScored: boolean;
  redBlackUnresolved: number;
  dustNotSmelted: number;
  phoNotAnalyzed: number;
  diamondUnreconciled: number;
  canClose: boolean;
  blockReasons: string[];
}

export function checkPeriodCloseReadiness(
  workers: WorkerRiskProfile[],
  dustPending: number,
  phoPending: number,
  diamondPending: number
): PeriodCloseAntiFraudCheck {
  const redBlack = workers.filter(w => w.riskLevel === "RED" || w.riskLevel === "BLACK");
  const unresolved = redBlack.filter(w => w.requiresGatekeeperReview).length;
  const reasons: string[] = [];

  if (unresolved > 0) reasons.push(`${unresolved} thợ RED/BLACK chưa giải trình`);
  if (dustPending > 0) reasons.push(`${dustPending} thợ chưa nấu bụi`);
  if (phoPending > 0) reasons.push(`${phoPending} mẫu chưa phân tích PHỔ`);
  if (diamondPending > 0) reasons.push(`${diamondPending} đơn chưa reconcile kim cương`);

  return {
    period: workers[0]?.period ?? "",
    allWorkersScored: workers.length > 0,
    redBlackUnresolved: unresolved,
    dustNotSmelted: dustPending,
    phoNotAnalyzed: phoPending,
    diamondUnreconciled: diamondPending,
    canClose: reasons.length === 0,
    blockReasons: reasons,
  };
}
