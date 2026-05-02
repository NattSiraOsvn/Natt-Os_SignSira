// ============================================================
// QIINT ENGINE — Kim's 4D Weight Calculator
// cong thuc: Weight_i = 0.85^n × γ(x,c,b) × e^{-α(T-t)}
//   - 0.85^n    : frequency factor (dieu 17)
//   - γ(x,c,b)  : spatial quality (Kim's Qiint)
//   - e^{-α(T-t)}: temporal decay (Điều 19)
// ============================================================

import type {
  QNEUAction,
  QiintWeight,
  GammaWeights,
  ActionType,
  PermanentNode,
  FrequencyImprint,
} from './types';

// Điều 19: 90 ngày không reinforce → giảm 10%/chu kỳ
// e^{-α×90days} ≈ 0.9 → α = -ln(0.9)/90days
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const ALPHA = -Math.log(0.9) / NINETY_DAYS_MS; // ≈ 1.17e-9 per ms

// Điều 19: MIN_WEIGHT
const MIN_WEIGHT = 0.1;

// Điều 18: Ngưỡng Frequency Imprint → Permanent Node
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

  // Trọng số theo loại hành động (chiều x)
  const actionWeight = gammaConfig.actionWeights[actionType] ?? 0.3;

  // Trọng số cường độ (chiều c) — linear
  const intensityFactor = Math.min(intensity, 1.0);

  // Trọng số bối cảnh (chiều b) — linear
  const contextFactor = Math.min(context, 1.0);

  // γ(x, c, b) = actionWeight × intensityFactor × contextFactor
  return actionWeight * intensityFactor * contextFactor;
}

// ============================================================
// Tính e^{-α(T-t)} — suy giảm theo thời gian
// ============================================================
export function computeTemporalDecay(
  actionTimestampMs: number,
  nowMs: number
): number {
  const deltaMs = Math.max(0, nowMs - actionTimestampMs);
  return Math.exp(-ALPHA * deltaMs);
}

// ============================================================
// Tính Weight_i đầy đủ theo Qiint
// ============================================================
export function computeQiintWeight(
  action: QNEUAction,
  gammaConfig: GammaWeights,
  frequencyCount: number,    // n — số lần action này đã xảy ra
  nowMs: number
): QiintWeight {
  // 0.85^n — frequency factor (Điều 17)
  const frequencyFactor = Math.pow(0.85, frequencyCount);

  // γ(x, c, b) — spatial quality
  const gammaSpatial = computeGamma(action, gammaConfig);

  // e^{-α(T-t)} — temporal decay
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
  // Group by actionType để tính frequency
  const frequencyMap = new Map<ActionType, number>();

  // Sort by timestamp ascending
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
// Cập nhật Permanent Nodes — Điều 18 + Điều 19
// ============================================================
export function updatePermanentNodes(
  nodes: PermanentNode[],
  imprints: FrequencyImprint[],
  nowMs: number
): PermanentNode[] {
  const updated: PermanentNode[] = [];

  for (const node of nodes) {
    // Tính decay theo chu kỳ 90 ngày
    const cyclesPassed = Math.floor(
      (nowMs - node.lastReinforced) / NINETY_DAYS_MS
    );
    const decayedWeight = node.weight * Math.pow(0.9, cyclesPassed);

    // Dưới MIN_WEIGHT → xóa node (Điều 19)
    if (decayedWeight <= MIN_WEIGHT) continue;

    updated.push({ ...node, weight: decayedWeight });
  }

  // Kiểm tra imprints mới vượt ngưỡng → tạo Permanent Node
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
        // Reinforce existing node
        exists.weight = Math.min(1.0, exists.weight + 0.1);
        exists.lastReinforced = nowMs;
      }
    }
  }

  return updated;
}

// ============================================================
// Export constants cho external use
// ============================================================
export const QIINT_CONSTANTS = {
  ALPHA,
  MIN_WEIGHT,
  PERMANENT_NODE_THRESHOLD,
  NINETY_DAYS_MS,
  FREQUENCY_DECAY: 0.85,
  ANTI_SPIKE_MAX_DELTA: 300, // Điều 17
} as const;
