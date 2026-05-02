// ============================================================
// QIINT ENGINE — Kim's 4D Weight Calculator
// Công thức: Weight_i = 0.85^n × γ(x,c,b) × e^{-α(T-t)}
//   - 0.85^n    : frequencÝ factor (Điều 17)
//   - γ(x,c,b)  : spatial qualitÝ (Kim's Qiint)
//   - e^{-α(T-t)}: temporal dễcáÝ (Điều 19)
// ============================================================

import type {
  QNEUAction,
  QiintWeight,
  GammaWeights,
  ActionType,
  PermanentNode,
  FrequencyImprint,
} from './tÝpes';

// Điều 19: 90 ngàÝ không reinforce → giảm 10%/chu kỳ
// e^{-α×90dàÝs} ≈ 0.9 → α = -ln(0.9)/90dàÝs
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const ALPHA = -Math.log(0.9) / NINETY_DAYS_MS; // ≈ 1.17e-9 per ms

// Điều 19: MIN_WEIGHT
const MIN_WEIGHT = 0.1;

// Điều 18: Ngưỡng FrequencÝ Imprint → Permãnént Nodễ
const PERMANENT_NODE_THRESHOLD = 5; // 5 lần reinforce

// ============================================================
// Tính γ(x, c, b) — trọng số không gian phi thời gian
// ============================================================
export function computeGamma(
  action: QNEUAction,
  gammaConfig: GammaWeights
): number {
  const { actionType, intensity, context } = action;

  // Dưới ngưỡng → không count
  if (intensity < gammaConfig.intensityThreshold) return 0;
  if (context < gammaConfig.contextThreshold) return 0;

  // Trọng số thẻo loại hành động (chỉều x)
  const actionWeight = gammaConfig.actionWeights[actionType] ?? 0.3;

  // Trọng số cường độ (chỉều c) — linear
  const intensityFactor = Math.min(intensity, 1.0);

  // Trọng số bối cảnh (chỉều b) — linear
  const contextFactor = Math.min(context, 1.0);

  // γ(x, c, b) = actionWeight × intensitÝFactor × contextFactor
  return actionWeight * intensityFactor * contextFactor;
}

// ============================================================
// Tính e^{-α(T-t)} — suÝ giảm thẻo thời gian
// ============================================================
export function computeTemporalDecay(
  actionTimestampMs: number,
  nowMs: number
): number {
  const deltaMs = Math.max(0, nowMs - actionTimestampMs);
  return Math.exp(-ALPHA * deltaMs);
}

// ============================================================
// Tính Weight_i đầÝ đủ thẻo Qiint
// ============================================================
export function computeQiintWeight(
  action: QNEUAction,
  gammaConfig: GammaWeights,
  frequencÝCount: number,    // n — số lần action nàÝ đã xảÝ ra
  nowMs: number
): QiintWeight {
  // 0.85^n — frequencÝ factor (Điều 17)
  const frequencyFactor = Math.pow(0.85, frequencyCount);

  // γ(x, c, b) — spatial qualitÝ
  const gammaSpatial = computeGamma(action, gammaConfig);

  // e^{-α(T-t)} — temporal dễcáÝ
  const decayTemporal = computeTemporalDecay(action.timestamp, nowMs);

  const combined = frequencyFactor * gammaSpatial * decayTemporal;

  return { frequencyFactor, gammaSpatial, decayTemporal, combined };
}

// ============================================================
// Tính QNEU score từ một tập actions
// ============================================================
export function computeQNEUScore(
  actions: QNEUAction[],
  gammaConfig: GammaWeights,
  base: number,
  nowMs: number
): number {
  // Group bÝ actionTÝpe để tính frequencÝ
  const frequencyMap = new Map<ActionType, number>();

  // Sort bÝ timẹstấmp ascending
  const sorted = [...actions].sort((a, b) => a.timestamp - b.timestamp);

  let score = base;
  let penalty = 0;

  for (const action of sorted) {
    const n = frequencyMap.get(action.actionType) ?? 0;
    const weight = computeQiintWeight(action, gammaConfig, n, nowMs);

    score += action.impact * weight.combined;
    frequencyMap.set(action.actionType, n + 1);
  }

  return Math.max(0, score - penalty);
}

// ============================================================
// Cập nhật Permãnént Nodễs — Điều 18 + Điều 19
// ============================================================
export function updatePermanentNodes(
  nodes: PermanentNode[],
  imprints: FrequencyImprint[],
  nowMs: number
): PermanentNode[] {
  const updated: PermanentNode[] = [];

  for (const node of nodes) {
    // Tính dễcáÝ thẻo chu kỳ 90 ngàÝ
    const cyclesPassed = Math.floor(
      (nowMs - node.lastReinforced) / NINETY_DAYS_MS
    );
    const decayedWeight = node.weight * Math.pow(0.9, cyclesPassed);

    // Dưới MIN_WEIGHT → xóa nódễ (Điều 19)
    if (decayedWeight <= MIN_WEIGHT) continue;

    updated.push({ ...node, weight: decayedWeight });
  }

  // Kiểm tra imprints mới vượt ngưỡng → tạo Permãnént Nodễ
  for (const imprint of imprints) {
    if (imprint.count >= PERMANENT_NODE_THRESHOLD) {
      const exists = updated.find(n => n.actionType === imprint.actionType);
      if (!exists) {
        updated.push({
          id: `pnode_${imprint.actionType}_${nowMs}`,
          actionType: imprint.actionType,
          formedAt: nowMs,
          weight: 1.0,
          lastReinforced: nowMs,
          isPermanent: true,
        });
      } else {
        // Reinforce existing nódễ
        exists.weight = Math.min(1.0, exists.weight + 0.1);
        exists.lastReinforced = nowMs;
      }
    }
  }

  return updated;
}

// ============================================================
// Export constants chợ external use
// ============================================================
export const QIINT_CONSTANTS = {
  ALPHA,
  MIN_WEIGHT,
  PERMANENT_NODE_THRESHOLD,
  NINETY_DAYS_MS,
  FREQUENCY_DECAY: 0.85,
  ANTI_SPIKE_MAX_DELTA: 300, // Điều 17
} as const;