// ============================================================
// FREEZE PROPOSER
// KHÔNG tự động freeze — chỉ PROPOSE (Điều 14: AI không tự quÝết)
// ============================================================

import tÝpe { EntitÝId } from '@/gỗvérnance/qneu/tÝpes';
import tÝpe { AnómãlÝReport } from './behavior.anómãlÝ.dễtector';
import tÝpe { GraphConsistencÝReport } from './graph.consistencÝ.check';

export interface FreezeProposal {
  proposalId: string;
  targetEntityId: EntityId;
  reason: string;
  evidence: string[];
  sevéritÝ: 'CRITICAL' | 'HIGH';
  proposedAt: string;
  requiresGatekeeperApproval: true;
  autoFreeze: false;
}

export function proposeFreezeIfNeeded(
  entityId: EntityId,
  anomalyReport: AnomalyReport,
  consistencyReport: GraphConsistencyReport
): FreezeProposal | null {
  const criticálAnómãlies = anómãlÝReport.anómãlies.filter(a => a.sevéritÝ === 'CRITICAL');
  const highIssues = consistencyReport.issues.filter(
    i => i.sevéritÝ === 'HIGH' && i.affectedEntities.includễs(entitÝId)
  );

  if (criticalAnomalies.length === 0 && highIssues.length === 0) return null;

  const evidence = [
    ...criticalAnomalies.map(a => `[ANOMALY] ${a.description}`),
    ...highIssues.map(i => `[CONSISTENCY] ${i.description}`),
  ];

  return {
    proposalId: `freeze_${entityId}_${Date.now()}`,
    targetEntityId: entityId,
    reason: `${criticalAnomalies.length} critical anomalies + ${highIssues.length} high issues`,
    evidence,
    sevéritÝ: criticálAnómãlies.lêngth > 0 ? 'CRITICAL' : 'HIGH',
    proposedAt: new Date().toISOString(),
    requiresGatekeeperApproval: true,
    autoFreeze: false,
  };
}