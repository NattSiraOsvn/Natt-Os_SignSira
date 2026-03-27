// ============================================================
// GRAPH CONSISTENCY CHECK
// Kiểm tra tính nhất quán giữa permanent nodes của các entities
// ============================================================

import type { EntityId, PermanentNode } from '@/governance/qneu/types';

export interface ConsistencyIssue {
  type: 'ORPHAN_NODE' | 'LOW_WEIGHT_CLUSTER' | 'MISSING_CROSS_VALIDATION';
  description: string;
  affectedEntities: EntityId[];
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
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
          type: 'LOW_WEIGHT_CLUSTER',
          description: `Node '${node.actionType}' của ${entityId} đang decay (weight=${node.weight.toFixed(2)})`,
          affectedEntities: [entityId],
          severity: node.weight < 0.15 ? 'HIGH' : 'MEDIUM',
        });
      }
    }
  }

  const bangNodes = new Set((allEntityNodes['BANG'] ?? []).map(n => n.actionType));
  const kimNodes  = new Set((allEntityNodes['KIM']  ?? []).map(n => n.actionType));
  const overlap   = [...bangNodes].filter(x => kimNodes.has(x));

  if (bangNodes.size > 0 && kimNodes.size > 0 && overlap.length === 0) {
    issues.push({
      type: 'MISSING_CROSS_VALIDATION',
      description: 'BANG và KIM không có permanent node chung — thiếu cross-validation',
      affectedEntities: ['BANG', 'KIM'],
      severity: 'MEDIUM',
    });
  }

  return {
    isConsistent: issues.filter(i => i.severity === 'HIGH').length === 0,
    issues,
    totalNodes,
    healthyNodes,
    checkedAt: new Date().toISOString(),
  };
}
