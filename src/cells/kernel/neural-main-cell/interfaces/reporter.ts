// @ts-nocheck
// ============================================================
// REPORTER — Xuất báo cáo Neural MAIN
// Điều 22.2: exportForLLMContext
// ============================================================

import type { EntityId, EntityScore } from '@/governance/qneu/types';
import { EventBus } from '@/core/events/event-bus';

export interface LLMContextExport {
  entityId: EntityId;
  topNodes: Array<{
    actionType: string;
    weight: number;
    formedAt: string;
    summary: string;
  }>;
  currentScore: number;
  exportedAt: string;
}

export function exportForLLMContext(
  entityScore: EntityScore,
  maxNodes: number = 10
): LLMContextExport {
  const topNodes = [...entityScore.permanentNodes]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxNodes)
    .map(node => ({
      actionType: node.actionType,
      weight: Math.round(node.weight * 100) / 100,
      formedAt: new Date(node.formedAt).toISOString(),
      summary: `${node.actionType} — weight ${(node.weight * 100).toFixed(0)}%`,
    }));

  return {
    entityId: entityScore.entityId,
    topNodes,
    currentScore: entityScore.currentScore,
    exportedAt: new Date().toISOString(),
  };
}

export function publishNeuralReport(report: LLMContextExport): void {
  EventBus.publish(
    { type: 'neural-main.context.exported' as any, payload: report },
    'neural-main-cell',
    undefined
  );
}
