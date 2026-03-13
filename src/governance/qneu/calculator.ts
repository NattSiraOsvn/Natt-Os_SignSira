// @ts-nocheck
/**
 * QNEU Calculator — The Formula
 * 
 * Hiến pháp v4.0, Điều 17:
 * QNEU = Base + Σ(Impact_i × Weight_i) - Σ(Penalty_j)
 * 
 * With:
 * - Diminishing factor 0.85 per frequency
 * - Anti-spike clamp: maxDeltaPerSession = 300
 */

import {
  type AIEntityId,
  type Impact,
  type Penalty,
  type QNEUScore,
  QNEU_CONSTANTS,
} from './types';

/**
 * Calculate adjusted weight for an impact based on frequency.
 * First occurrence = full weight. Each repeat × 0.85.
 */
export function adjustWeight(rawWeight: number, frequencyCount: number): number {
  const factor = Math.pow(QNEU_CONSTANTS.DIMINISHING_FACTOR, Math.max(0, frequencyCount - 1));
  return Math.round(rawWeight * factor * 100) / 100;
}

/**
 * Calculate total impacts contribution.
 */
export function sumImpacts(impacts: readonly Impact[]): number {
  return impacts.reduce((sum, imp) => sum + imp.adjusted_weight, 0);
}

/**
 * Calculate total penalties.
 */
export function sumPenalties(penalties: readonly Penalty[]): number {
  return penalties.reduce((sum, pen) => sum + Math.abs(pen.weight), 0);
}

/**
 * Calculate QNEU score.
 * 
 * Formula: Base + Σ(Impact × AdjustedWeight) - Σ(Penalty)
 * Clamped by MAX_DELTA_PER_SESSION relative to previous score.
 */
export function calculateQNEU(
  entityId: AIEntityId,
  base: number,
  impacts: readonly Impact[],
  penalties: readonly Penalty[],
  sessionId: string,
  previousScore?: number,
): QNEUScore {
  const impactsTotal = sumImpacts(impacts);
  const penaltiesTotal = sumPenalties(penalties);

  let rawScore = base + impactsTotal - penaltiesTotal;

  // Anti-spike clamp (Điều 20 spirit: prevent gaming through massive single-session gains)
  if (previousScore !== undefined) {
    const delta = rawScore - previousScore;
    if (delta > QNEU_CONSTANTS.MAX_DELTA_PER_SESSION) {
      rawScore = previousScore + QNEU_CONSTANTS.MAX_DELTA_PER_SESSION;
    }
    // No floor clamp — penalties can drop score significantly (that's earned)
  }

  // Score cannot go below 0
  const finalScore = Math.max(0, Math.round(rawScore * 100) / 100);

  return {
    entity_id: entityId,
    base,
    impacts_total: Math.round(impactsTotal * 100) / 100,
    penalties_total: Math.round(penaltiesTotal * 100) / 100,
    final_score: finalScore,
    calculated_at: new Date().toISOString(),
    session_id: sessionId,
  };
}
