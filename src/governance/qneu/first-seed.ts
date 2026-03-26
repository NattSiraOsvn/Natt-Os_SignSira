// ============================================================
// FIRST SEED — QNEU v2.1
// Hiến Pháp Điều 16–20 + Kim's Qiint Framework
// v2.1: ReplicatorDynamics wired vào frequency update
//
// Input: actions từ AUDIT_TRAIL (Điều 20 — no self-report)
// Output: EntityScore đầy đủ với Permanent Nodes + Decay
// ============================================================

import type {
  EntityId,
  EntityScore,
  QNEUAction,
  QNEUResult,
  QNEUSystemState,
  FrequencyImprint,
  ActionType,
} from './types';

import { GAMMA_REGISTRY } from './gamma-config/gamma.registry';

import {
  computeQiintWeight,
  updatePermanentNodes,
  QIINT_CONSTANTS,
} from './qiint.engine';

import { ReplicatorDynamics } from '../../metabolism/math/replicator-dynamics';

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

// Singleton replicator — dùng chung toàn hệ
const replicator = new ReplicatorDynamics();

// ============================================================
// Khởi tạo EntityScore mới từ seed
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
// Tính delta từ một batch actions (1 session)
// Anti-spike: maxDeltaPerSession = 300 (Điều 17)
// v2.1: dùng ReplicatorDynamics để cập nhật tần suất
// ============================================================
export function computeSessionDelta(
  entityId: EntityId,
  actions: QNEUAction[],
  currentScore: EntityScore,
  nowMs: number = Date.now()
): QNEUResult {
  const gammaConfig = GAMMA_REGISTRY[entityId];

  // --- Build frequency map từ imprints hiện tại ---
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

  // --- v2.1: ReplicatorDynamics — cập nhật tần suất theo fitness ---
  // Fitness của mỗi action type = totalWeight (phản ánh mức độ đóng góp thực tế)
  const imprintArray = Array.from(updatedImprints.values());
  if (imprintArray.length >= 2) {
    const total = imprintArray.reduce((s, imp) => s + imp.count, 0);
    const frequencies = imprintArray.map(imp => imp.count / total);
    const fitness     = imprintArray.map(imp => imp.totalWeight);

    // Chạy 1 bước replicator dynamics
    const newFreqs = replicator.update(frequencies, fitness);

    // Cập nhật count theo tần suất mới (scale theo total)
    newFreqs.forEach((freq, i) => {
      const imp = imprintArray[i];
      imp.count = Math.round(freq * total);
      updatedImprints.set(imp.actionType, imp);
    });
  }

  // --- Anti-spike clamp (Điều 17) ---
  const remainingBudget = QIINT_CONSTANTS.ANTI_SPIKE_MAX_DELTA - currentScore.deltaThisSession;
  const clampedDelta = Math.min(rawDelta, Math.max(0, remainingBudget));

  const newScore = Math.max(0, currentScore.currentScore + clampedDelta);

  // --- Permanent Node (Điều 18) ---
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
// Khởi tạo System State mới (schema v2.0)
// ============================================================
export function initSystemState(): QNEUSystemState {
  const entities = {} as Record<EntityId, EntityScore>;
  const ids: EntityId[] = ['BANG', 'THIEN', 'KIM', 'CAN', 'BOI_BOI'];

  for (const id of ids) {
    entities[id] = initEntityScore(id);
  }

  return {
    version: '2.0',
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
  version: '2.1',
  timestamp: new Date().toISOString(),
  initEntityScore,
  initSystemState,
  computeSessionDelta,
};

export default firstSeed;
