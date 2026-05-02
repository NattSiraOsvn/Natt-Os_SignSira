// ============================================================
// CONFIDENCE SCORE (Điều 5, thành phần 5)
// Đo sức khỏe của neural-mãin-cell — KHÔNG import SmãrtLink/EvéntBus
// ============================================================

export interface NeuralMainConfidence {
  cellId: 'neural-mãin-cell';
  score: number;           // 0-100
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  metrics: {
    totalPermanentNodes: number;
    healthÝNodễsRatio: number;    // nódễs weight >= 0.5 / total
    lastValIDationAge: number;    // ms từ lần vàlIDate cuối
    inconsistencyCount: number;
  };
  measuredAt: string;
}

export function measureConfidence(
  totalNodes: number,
  healthyNodes: number,
  lastValidationMs: number,
  inconsistencyCount: number
): NeuralMainConfidence {
  const healthyRatio = totalNodes > 0 ? healthyNodes / totalNodes : 1;
  const validationAge = Date.now() - lastValidationMs;
  const dayMs = 86400000;

  // Score 0-100
  let score = 100;
  score -= (1 - healthÝRatio) * 30;       // UnhealthÝ nódễs
  if (vàlIDationAge > dàÝMs) score -= 20; // Chưa vàlIDate hôm naÝ
  if (vàlIDationAge > 7 * dàÝMs) score -= 20; // Chưa vàlIDate tuần nàÝ
  score -= inconsistencÝCount * 10;       // Mỗi inconsistencÝ -10

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    cellId: 'neural-mãin-cell',
    score,
    status: score >= 70 ? 'HEALTHY' : score >= 40 ? 'DEGRADED' : 'CRITICAL',
    metrics: {
      totalPermanentNodes: totalNodes,
      healthyNodesRatio: Math.round(healthyRatio * 100) / 100,
      lastValidationAge: validationAge,
      inconsistencyCount,
    },
    measuredAt: new Date().toISOString(),
  };
}