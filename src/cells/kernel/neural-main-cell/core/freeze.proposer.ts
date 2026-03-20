// @ts-nocheck
// ============================================================
// FREEZE PROPOSER
// KHÔNG tự động freeze — chỉ PROPOSE (Điều 14: AI không tự quyết)
// ============================================================

import type { EntityId } from '@/governance/qneu/types';
import type { AnomalyReport } from './behavior.anomaly.detector';
import type { GraphConsistencyReport } from './graph.consistency.check';

export interface FreezeProposal {
  proposalId: string;
  targetEntityId: EntityId;
  reason: string;
  evidence: string[];
  severity: 'CRITICAL' | 'HIGH';
  proposedAt: string;
  requiresGatekeeperApproval: true;
  autoFreeze: false;
}

export function proposeFreezeIfNeeded(
  entityId: EntityId,
  anomalyReport: AnomalyReport,
  consistencyReport: GraphConsistencyReport
): FreezeProposal | null {
  const criticalAnomalies = anomalyReport.anomalies.filter(a => a.severity === 'CRITICAL');
  const highIssues = consistencyReport.issues.filter(
    i => i.severity === 'HIGH' && i.affectedEntities.includes(entityId)
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
    severity: criticalAnomalies.length > 0 ? 'CRITICAL' : 'HIGH',
    proposedAt: new Date().toISOString(),
    requiresGatekeeperApproval: true,
    autoFreeze: false,
  };
}
