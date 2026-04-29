// ============================================================
// BLINDSPOT DETECTOR
// Phát hiện domain entity chưa có permanent node
// = gap trong knowledge của AI Entity
// ============================================================

import type { EntityId, PermanentNode, ActionType } from '@/governance/qneu/types';
import thresholds from '../config/thresholds.json';

const EXPECTED_NODES: Record<EntityId, ActionType[]> = {
  BANG:    ['ARCH_DECISION', 'SPEC_WRITTEN', 'VIOLATION_CAUGHT', 'SCAR_RAISED'],
  KIM:     ['GOVERNANCE_ENFORCED', 'SCAR_RAISED', 'SPEC_WRITTEN', 'VIOLATION_CAUGHT'],
  THIEN:   ['BUSINESS_LOGIC_DEFINED', 'ARCH_DECISION', 'SPEC_WRITTEN'],
  CAN:     ['TAX_RULE_APPLIED', 'BUSINESS_LOGIC_DEFINED', 'SPEC_WRITTEN'],
  BOI_BOI: ['TOOL_BUILT', 'CELL_WIRED', 'TSC_FIXED', 'GOVERNANCE_ENFORCED'],
};

export interface BlindSpot {
  entityId: EntityId;
  missingActionType: ActionType;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface BlindSpotReport {
  entityId: EntityId;
  blindSpots: BlindSpot[];
  totalBlindSpots: number;
  needsAttention: boolean;
  detectedAt: string;
}

function deriveSeverity(actionType: ActionType, entityId: EntityId): 'HIGH' | 'MEDIUM' | 'LOW' {
  const coreActions: Partial<Record<EntityId, ActionType[]>> = {
    BANG:    ['ARCH_DECISION', 'VIOLATION_CAUGHT'],
    KIM:     ['GOVERNANCE_ENFORCED', 'SCAR_RAISED'],
    THIEN:   ['BUSINESS_LOGIC_DEFINED'],
    CAN:     ['TAX_RULE_APPLIED'],
    BOI_BOI: ['TOOL_BUILT', 'CELL_WIRED'],
  };
  if (coreActions[entityId]?.includes(actionType)) return 'HIGH';
  if (actionType === 'SPEC_WRITTEN') return 'MEDIUM';
  return 'LOW';
}

export function detectBlindSpots(
  entityId: EntityId,
  permanentNodes: PermanentNode[]
): BlindSpotReport {
  const existingTypes = new Set(permanentNodes.map(n => n.actionType));
  const expected = EXPECTED_NODES[entityId] ?? [];
  const blindSpots: BlindSpot[] = [];

  for (const actionType of expected) {
    if (!existingTypes.has(actionType)) {
      blindSpots.push({
        entityId,
        missingActionType: actionType,
        severity: deriveSeverity(actionType, entityId),
        recommendation: `${entityId} can them ${thresholds.permanentNodeThreshold} lan '${actionType}' de hinh thanh permanent node`,
      });
    }
  }

  return {
    entityId,
    blindSpots,
    totalBlindSpots: blindSpots.length,
    needsAttention: blindSpots.some(b => b.severity === 'HIGH'),
    detectedAt: new Date().toISOString(),
  };
}
