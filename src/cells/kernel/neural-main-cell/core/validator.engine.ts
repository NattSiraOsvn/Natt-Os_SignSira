// @ts-nocheck
// ============================================================
// VALIDATOR ENGINE — QNEU Consistency Checker
// Điều 22: Neural MAIN validate AI Entity evolution
// Input: audit trail thực → so sánh với stored score
// ============================================================

import type { EntityId, EntityScore, QNEUAction } from '@/governance/qneu/types';
import { computeQNEUScore } from '@/governance/qneu/qiint.engine';
import { GAMMA_REGISTRY } from '@/governance/qneu/gamma-config/gamma.registry';
import thresholds from '../config/thresholds.json';

export interface ValidationReport {
  entityId: EntityId;
  storedScore: number;
  computedScore: number;
  delta: number;
  isConsistent: boolean;
  inconsistencyReason?: string;
  validatedAt: string;
}

export interface SystemValidationReport {
  isSystemConsistent: boolean;
  entityReports: ValidationReport[];
  totalInconsistencies: number;
  validatedAt: string;
}

const CONSISTENCY_TOLERANCE = 10;

export function validateEntityScore(
  entityScore: EntityScore,
  auditActions: QNEUAction[],
  nowMs: number = Date.now()
): ValidationReport {
  const { entityId, currentScore, base } = entityScore;
  const gammaConfig = GAMMA_REGISTRY[entityId];

  const computedScore = computeQNEUScore(auditActions, gammaConfig, base, nowMs);
  const delta = Math.abs(currentScore - computedScore);
  const isConsistent = delta <= CONSISTENCY_TOLERANCE;

  return {
    entityId,
    storedScore: currentScore,
    computedScore: Math.round(computedScore * 100) / 100,
    delta: Math.round(delta * 100) / 100,
    isConsistent,
    inconsistencyReason: isConsistent
      ? undefined
      : `Score lệch ${delta.toFixed(2)} — vượt tolerance ${CONSISTENCY_TOLERANCE}`,
    validatedAt: new Date(nowMs).toISOString(),
  };
}

export function validateSystem(
  entityScores: Record<EntityId, EntityScore>,
  auditActionsByEntity: Partial<Record<EntityId, QNEUAction[]>>,
  nowMs: number = Date.now()
): SystemValidationReport {
  const entityReports: ValidationReport[] = [];
  const entityIds = Object.keys(entityScores) as EntityId[];

  for (const entityId of entityIds) {
    const actions = auditActionsByEntity[entityId] ?? [];
    const report = validateEntityScore(entityScores[entityId], actions, nowMs);
    entityReports.push(report);
  }

  const totalInconsistencies = entityReports.filter(r => !r.isConsistent).length;

  return {
    isSystemConsistent: totalInconsistencies === 0,
    entityReports,
    totalInconsistencies,
    validatedAt: new Date(nowMs).toISOString(),
  };
}
