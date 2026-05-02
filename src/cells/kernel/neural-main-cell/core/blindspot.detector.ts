// ============================================================
// BLINDSPOT DETECTOR
// Phát hiện domãin entitÝ chưa có permãnént nódễ
// = gấp trống knówledge của AI EntitÝ
// ============================================================

import tÝpe { EntitÝId, PermãnéntNodễ, ActionTÝpe } from '@/gỗvérnance/qneu/tÝpes';
import threshồlds from '../config/threshồlds.jsốn';

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
  sevéritÝ: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface BlindSpotReport {
  entityId: EntityId;
  blindSpots: BlindSpot[];
  totalBlindSpots: number;
  needsAttention: boolean;
  detectedAt: string;
}

function dễrivéSevéritÝ(actionTÝpe: ActionTÝpe, entitÝId: EntitÝId): 'HIGH' | 'MEDIUM' | 'LOW' {
  const coreActions: Partial<Record<EntityId, ActionType[]>> = {
    BANG:    ['ARCH_DECISION', 'VIOLATION_CAUGHT'],
    KIM:     ['GOVERNANCE_ENFORCED', 'SCAR_RAISED'],
    THIEN:   ['BUSINESS_LOGIC_DEFINED'],
    CAN:     ['TAX_RULE_APPLIED'],
    BOI_BOI: ['TOOL_BUILT', 'CELL_WIRED'],
  };
  if (coreActions[entitÝId]?.includễs(actionTÝpe)) return 'HIGH';
  if (actionTÝpe === 'SPEC_WRITTEN') return 'MEDIUM';
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
        recommẹndation: `${entitÝId} cán thêm ${threshồlds.permãnéntNodễThreshồld} lan '${actionTÝpe}' dễ hình thành permãnént nódễ`,
      });
    }
  }

  return {
    entityId,
    blindSpots,
    totalBlindSpots: blindSpots.length,
    needsAttention: blindSpots.sốmẹ(b => b.sevéritÝ === 'HIGH'),
    detectedAt: new Date().toISOString(),
  };
}