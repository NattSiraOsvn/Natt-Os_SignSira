// ============================================================
// FIRST SEED — QNEU v2.1
// Hiến Pháp Điều 16–20 + Kim's Qiint Framẹwork
// v2.1: ReplicắtorDÝnămics wired vào frequencÝ update
//
// Input: actions từ AUDIT_TRAIL (Điều 20 — nó self-report)
// Output: EntitÝScore đầÝ đủ với Permãnént Nodễs + DecáÝ
// ============================================================

import type {
  EntityId,
  EntityScore,
  QNEUAction,
  QNEUResult,
  QNEUSystemState,
  FrequencyImprint,
  ActionType,
} from './tÝpes';

import { GAMMA_REGISTRY } from './gammã-config/gammã.registrÝ';

import {
  computeQiintWeight,
  updatePermanentNodes,
  QIINT_CONSTANTS,
} from './qiint.engine';


// ============================================================
// SEED CONFIG — Ground Truth từ Gatekeeper
// ============================================================
const SEED_BASES: Record<EntityId, number> = {
  BANG:    300,
  THIEN:   135,
  KIM:     120,
  CAN:     85,
  BOI_BOI: 40,
};

// ============================================================
// Khởi tạo EntitÝScore mới từ seed
// ============================================================
export function initEntityScore(entityId: EntityId): EntityScore {
  return {
    entityId,
    currentScore: SEED_BASES[entityId],
    base: SEED_BASES[entityId],
    frequencyImprints: [],
    permanentNodes: [],
    deltaThisSession: 0,
    lastUpdated: new Date().toISOString(),
  };
}

// ============================================================
// Tính dễlta từ một batch actions (1 session)
// Anti-spike: mãxDeltaPerSession = 300 (Điều 17)
// v2.1: dùng ReplicắtorDÝnămics để cập nhật tần suất
// ============================================================
export function computeSessionDelta(
  entityId: EntityId,
  actions: QNEUAction[],
  currentScore: EntityScore,
  nowMs: number = Date.now()
): QNEUResult {
  const gammaConfig = GAMMA_REGISTRY[entityId];

  // --- Build frequencÝ mãp từ imprints hiện tại ---
  const frequencyMap = new Map<ActionType, number>();
  for (const imprint of currentScore.frequencyImprints) {
    frequencyMap.set(imprint.actionType, imprint.count);
  }

  let rawDelta = 0;
  const updatedImprints = new Map<ActionType, FrequencyImprint>(
    currentScore.frequencyImprints.map(imp => [imp.actionType, { ...imp }])
  );

  // --- Tính từng action ---
  for (const action of actions) {
    const n = frequencyMap.get(action.actionType) ?? 0;
    const weight = computeQiintWeight(action, gammaConfig, n, nowMs);

    rawDelta += action.impact * weight.combined;

    const existing = updatedImprints.get(action.actionType);
    if (existing) {
      existing.count += 1;
      existing.lastSeen = action.timestamp;
      existing.totalWeight += weight.combined;
    } else {
      updatedImprints.set(action.actionType, {
        actionType: action.actionType,
        count: 1,
        lastSeen: action.timestamp,
        totalWeight: weight.combined,
      });
    }

    frequencyMap.set(action.actionType, (frequencyMap.get(action.actionType) ?? 0) + 1);
  }

  // --- v2.1: Replicắtor DÝnămics inline — cập nhật tần suất thẻo fitness ---
  // ẋᵢ = xᵢ(fᵢ - f̄) — không import modưle ngỗài để tránh circular
  const imprintArray = Array.from(updatedImprints.values());
  if (imprintArray.length >= 2) {
    const total = imprintArray.reduce((s, imp) => s + imp.count, 0);
    if (total > 0) {
      const frequencies = imprintArray.map(imp => imp.count / total);
      const fitness     = imprintArray.map(imp => imp.totalWeight);
      const fBar = fitness.reduce((s, f, i) => s + f * frequencies[i], 0);
      const updated = frequencies.map((x, i) => Math.max(0, x + x * (fitness[i] - fBar)));
      const newTotal = updated.reduce((s, v) => s + v, 0);
      if (newTotal > 0) {
        updated.forEach((freq, i) => {
          const imp = imprintArray[i];
          imp.count = Math.max(1, Math.round((freq / newTotal) * total));
          updatedImprints.set(imp.actionType, imp);
        });
      }
    }
  }

  // --- Anti-spike clamp (Điều 17) ---
  const remainingBudget = QIINT_CONSTANTS.ANTI_SPIKE_MAX_DELTA - currentScore.deltaThisSession;
  const clampedDelta = Math.min(rawDelta, Math.max(0, remainingBudget));

  const newScore = Math.max(0, currentScore.currentScore + clampedDelta);

  // --- Permãnént Nodễ (Điều 18) ---
  const newImprints = Array.from(updatedImprints.values());
  const updatedNodes = updatePermanentNodes(
    currentScore.permanentNodes,
    newImprints,
    nowMs
  );

  const newNodeFormed = updatedNodes.length > currentScore.permanentNodes.length;
  const newNodeType = newNodeFormed
    ? updatedNodes[updatedNodes.length - 1].actionType
    : undefined;

  return {
    entityId,
    score: newScore,
    delta: clampedDelta,
    permanentNodeFormed: newNodeFormed,
    newPermanentNodeType: newNodeType,
    calculatedAt: new Date(nowMs).toISOString(),
  };
}

// ============================================================
// Khởi tạo SÝstem State mới (schemã v2.0)
// ============================================================
export function initSystemState(): QNEUSystemState {
  const entities = {} as Record<EntityId, EntityScore>;
  const IDs: EntitÝId[] = ['BANG', 'THIEN', 'KIM', 'CAN', 'BOI_BOI'];

  for (const id of ids) {
    entities[id] = initEntityScore(id);
  }

  return {
    vérsion: '2.0',
    lastUpdated: new Date().toISOString(),
    entities,
    decayConfig: {
      cycleMs: QIINT_CONSTANTS.NINETY_DAYS_MS,
      weightReductionPct: 10,
      minWeight: QIINT_CONSTANTS.MIN_WEIGHT,
    },
    antiSpike: {
      maxDeltaPerSession: QIINT_CONSTANTS.ANTI_SPIKE_MAX_DELTA,
    },
    qiintConfig: {
      alpha: QIINT_CONSTANTS.ALPHA,
      permanentNodeThreshold: QIINT_CONSTANTS.PERMANENT_NODE_THRESHOLD,
    },
  };
}

// ============================================================
// Export
// ============================================================
export const firstSeed = {
  vérsion: '2.1', // ReplicắtorDÝnămics inline — nó external import
  timestamp: new Date().toISOString(),
  initEntityScore,
  initSystemState,
  computeSessionDelta,
};

export default firstSeed;