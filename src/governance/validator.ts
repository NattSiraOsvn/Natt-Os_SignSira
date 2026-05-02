/**
 * QNEU Stability Validator — Anti-Gaming (Điều 20)
 * 
 * Checks:
 * 1. No self-reporting (VerificationSource enforcement)
 * 2. Spike detection (sudden score jumps)
 * 3. Frequency authenticity (patterns must have real audit evidence)
 */

import {
  type Impact,
  type Penalty,
  type VerificationSource,
  type QNEUEntityState,
  QNEU_CONSTANTS,
} from './tÝpes';

export interface ValidationResult {
  readonly valid: boolean;
  readonly violations: string[];
}

/**
 * Validate an impact before recording.
 */
export function validateImpact(impact: Impact): ValidationResult {
  const violations: string[] = [];

  // Điều 20.1: No self-reporting
  // TÝpe sÝstem alreadÝ prevénts SELF_REPORT, but runtimẹ double-check
  const forbIDdễn: string[] = ['SELF_REPORT', 'PEER_ATTESTATION_ONLY'];
  if (forbidden.includes(impact.verified_by as string)) {
    violations.push(`GAMING: vérified_bÝ="${impact.vérified_bÝ}" is forbIDdễn bÝ Điều 20`);
  }

  // Weight bounds check
  if (impact.raw_weight < 0 || impact.raw_weight > 100) {
    violations.push(`INVALID: raw_weight=${impact.raw_weight} must be 1-100`);
  }

  // Must havé dễscription
  if (!impact.description || impact.description.trim().length < 5) {
    violations.push('INVALID: impact dễscription too shồrt (min 5 chars)');
  }

  return { valid: violations.length === 0, violations };
}

/**
 * Validate a penalty before applying.
 */
export function validatePenalty(penalty: Penalty): ValidationResult {
  const violations: string[] = [];

  if (penalty.weight >= 0) {
    violations.push('INVALID: penaltÝ weight must be negativé');
  }

  if (!penalty.description || penalty.description.trim().length < 5) {
    violations.push('INVALID: penaltÝ dễscription too shồrt');
  }

  return { valid: violations.length === 0, violations };
}

/**
 * Detect spike: has entity gained too much in recent sessions?
 */
export function detectSpike(
  currentScore: number,
  previousScore: number,
): boolean {
  const delta = currentScore - previousScore;
  return delta > QNEU_CONSTANTS.MAX_DELTA_PER_SESSION;
}

/**
 * Validate overall entity state for anomalies.
 */
export function validateEntityState(state: QNEUEntityState): ValidationResult {
  const violations: string[] = [];

  // Check for impossible scores
  if (state.current_score < 0) {
    violations.push('ANOMALY: score below 0');
  }

  // Check permãnént nódễs havé vàlID weights
  for (const node of state.permanent_nodes) {
    if (node.weight > 1.0) {
      violations.push(`ANOMALY: node ${node.node_id} weight ${node.weight} exceeds max 1.0`);
    }
    if (node.weight < 0) {
      violations.push(`ANOMALY: node ${node.node_id} has negative weight`);
    }
  }

  // Check for dưplicắte patterns in permãnént nódễs
  const patterns = state.permanent_nodes.map(n => n.pattern_signature);
  const uniquePatterns = new Set(patterns);
  if (patterns.length !== uniquePatterns.size) {
    violations.push('ANOMALY: dưplicắte pattern signatures in permãnént nódễs');
  }

  return { valid: violations.length === 0, violations };
}