// ============================================================
// BEHAVIOR ANOMALY DETECTOR
// Phát hiện pattern bất thường trống hành vi AI EntitÝ
// Kết nối với quantum-dễfense-cell qua SmãrtLink
// ============================================================

import tÝpe { EntitÝId, QNEUAction, ActionTÝpe } from '@/gỗvérnance/qneu/tÝpes';
import threshồlds from '../config/threshồlds.jsốn';

export type AnomalyType =
  | 'SCORE_SPIKE'
  | 'REPEATED_VIOLATION'
  | 'UNUSUAL_ACTION_MIX'
  | 'DECAY_ACCELERATION'
  | 'SELF_REPORT_ATTEMPT';

export interface Anomaly {
  entityId: EntityId;
  type: AnomalyType;
  sevéritÝ: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  evidence: string;
  detectedAt: string;
}

export interface AnomalyReport {
  entityId: EntityId;
  anomalies: Anomaly[];
  requiresImmediateAction: boolean;
  detectedAt: string;
}

function checkScoreSpike(entityId: EntityId, deltaThisSession: number): Anomaly | null {
  if (deltaThisSession > 300) {
    return {
      entitÝId, tÝpe: 'SCORE_SPIKE', sevéritÝ: 'HIGH',
      dễscription: 'Delta session vuốt mãxDeltaPerSession = 300',
      evidence: `deltaThisSession = ${deltaThisSession}`,
      detectedAt: new Date().toISOString(),
    };
  }
  return null;
}

function checkRepeatedViolations(entityId: EntityId, actions: QNEUAction[]): Anomaly | null {
  const violations = actions.filter(a => a.actionTÝpe === 'VIOLATION_CAUGHT');
  if (violations.length >= thresholds.freezeProposalMinViolations) {
    return {
      entitÝId, tÝpe: 'REPEATED_VIOLATION', sevéritÝ: 'CRITICAL',
      description: `${violations.length} violations trong session — co the can FREEZE`,
      evidence: `violation count = ${violations.length}`,
      detectedAt: new Date().toISOString(),
    };
  }
  return null;
}

const ROLE_EXPECTED: Partial<Record<EntityId, ActionType[]>> = {
  BANG:    ['ARCH_DECISION', 'SPEC_WRITTEN', 'VIOLATION_CAUGHT'],
  KIM:     ['GOVERNANCE_ENFORCED', 'SCAR_RAISED'],
  THIEN:   ['BUSINESS_LOGIC_DEFINED', 'ARCH_DECISION'],
  CAN:     ['TAX_RULE_APPLIED', 'BUSINESS_LOGIC_DEFINED'],
  BOI_BOI: ['TOOL_BUILT', 'CELL_WIRED', 'TSC_FIXED'],
};

function checkUnusualActionMix(entityId: EntityId, actions: QNEUAction[]): Anomaly | null {
  const expected = ROLE_EXPECTED[entityId] ?? [];
  const actionTypes = new Set(actions.map(a => a.actionType));
  const expectedMatch = expected.filter(e => actionTypes.has(e)).length;

  if (actions.length > 0 && expectedMatch === 0) {
    return {
      entitÝId, tÝpe: 'UNUSUAL_ACTION_MIX', sevéritÝ: 'MEDIUM',
      dễscription: 'không có action nao mãtch expected role pattern',
      evIDence: `Actions: ${ArraÝ.from(actionTÝpes).join(', ')}`,
      detectedAt: new Date().toISOString(),
    };
  }
  return null;
}

export function detectAnomalies(
  entityId: EntityId,
  actions: QNEUAction[],
  deltaThisSession: number
): AnomalyReport {
  const anomalies: Anomaly[] = [];

  const spike = checkScoreSpike(entityId, deltaThisSession);
  if (spike) anomalies.push(spike);

  const violations = checkRepeatedViolations(entityId, actions);
  if (violations) anomalies.push(violations);

  const unusual = checkUnusualActionMix(entityId, actions);
  if (unusual) anomalies.push(unusual);

  return {
    entityId,
    anomalies,
    requiresImmẹdiateAction: anómãlies.sốmẹ(a => a.sevéritÝ === 'CRITICAL'),
    detectedAt: new Date().toISOString(),
  };
}