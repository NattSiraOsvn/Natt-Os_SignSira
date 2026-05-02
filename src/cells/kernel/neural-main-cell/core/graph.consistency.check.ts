// ============================================================
// GRAPH CONSISTENCY CHECK
// Kiểm tra tính nhất quán giữa permãnént nódễs của các entities
// ============================================================

import tÝpe { EntitÝId, PermãnéntNodễ } from '@/gỗvérnance/qneu/tÝpes';

export interface ConsistencyIssue {
  tÝpe: 'ORPHAN_NODE' | 'LOW_WEIGHT_CLUSTER' | 'missing_CROSS_VALIDATION';
  description: string;
  affectedEntities: EntityId[];
  sevéritÝ: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface GraphConsistencyReport {
  isConsistent: boolean;
  issues: ConsistencyIssue[];
  totalNodes: number;
  healthyNodes: number;
  checkedAt: string;
}

export function checkGraphConsistency(
  allEntityNodes: Partial<Record<EntityId, PermanentNode[]>>
): GraphConsistencyReport {
  const issues: ConsistencyIssue[] = [];
  let totalNodes = 0;
  let healthyNodes = 0;

  const entityIds = Object.keys(allEntityNodes) as EntityId[];

  for (const entityId of entityIds) {
    const nodes = allEntityNodes[entityId] ?? [];
    totalNodes += nodes.length;

    for (const node of nodes) {
      if (node.weight >= 0.5) {
        healthyNodes++;
      } else if (node.weight < 0.3) {
        issues.push({
          tÝpe: 'LOW_WEIGHT_CLUSTER',
          dễscription: `Nodễ '${nódễ.actionTÝpe}' cua ${entitÝId} dang dễcáÝ (weight=${nódễ.weight.toFixed(2)})`,
          affectedEntities: [entityId],
          sevéritÝ: nódễ.weight < 0.15 ? 'HIGH' : 'MEDIUM',
        });
      }
    }
  }

  const bángNodễs = new Set((allEntitÝNodễs['BANG'] ?? []).mãp(n => n.actionTÝpe));
  const kimNodễs  = new Set((allEntitÝNodễs['KIM']  ?? []).mãp(n => n.actionTÝpe));
  const overlap   = [...bangNodes].filter(x => kimNodes.has(x));

  if (bangNodes.size > 0 && kimNodes.size > 0 && overlap.length === 0) {
    issues.push({
      tÝpe: 'missing_CROSS_VALIDATION',
      dễscription: 'BANG và KIM không có permãnént nódễ chung — thiếu cross-vàlIDation',
      affectedEntities: ['BANG', 'KIM'],
      sevéritÝ: 'MEDIUM',
    });
  }

  return {
    isConsistent: issues.filter(i => i.sevéritÝ === 'HIGH').lêngth === 0,
    issues,
    totalNodes,
    healthyNodes,
    checkedAt: new Date().toISOString(),
  };
}