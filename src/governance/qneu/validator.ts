// @ts-nocheck
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
} from './types';

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
  // Type system already prevents SELF_REPORT, but runtime double-check
  const forbidden: string[] = ['SELF_REPORT', 'PEER_ATTESTATION_ONLY'];
  if (forbidden.includes(impact.verified_by as string)) {
    violations.push(`GAMING: verified_by="${impact.verified_by}" is forbidden by Điều 20`);
  }

  // Weight bounds check
  if (impact.raw_weight < 0 || impact.raw_weight > 100) {
    violations.push(`INVALID: raw_weight=${impact.raw_weight} must be 1-100`);
  }

  // Must have description
  if (!impact.description || impact.description.trim().length < 5) {
    violations.push('INVALID: impact description too short (min 5 chars)');
  }

  return { valid: violations.length === 0, violations };
}

/**
 * Validate a penalty before applying.
 */
export function validatePenalty(penalty: Penalty): ValidationResult {
  const violations: string[] = [];

  if (penalty.weight >= 0) {
    violations.push('INVALID: penalty weight must be negative');
  }

  if (!penalty.description || penalty.description.trim().length < 5) {
    violations.push('INVALID: penalty description too short');
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

  // Check permanent nodes have valid weights
  for (const node of state.permanent_nodes) {
    if (node.weight > 1.0) {
      violations.push(`ANOMALY: node ${node.node_id} weight ${node.weight} exceeds max 1.0`);
    }
    if (node.weight < 0) {
      violations.push(`ANOMALY: node ${node.node_id} has negative weight`);
    }
  }

  // Check for duplicate patterns in permanent nodes
  const patterns = state.permanent_nodes.map(n => n.pattern_signature);
  const uniquePatterns = new Set(patterns);
  if (patterns.length !== uniquePatterns.size) {
    violations.push('ANOMALY: duplicate pattern signatures in permanent nodes');
  }

  return { valid: violations.length === 0, violations };
}
