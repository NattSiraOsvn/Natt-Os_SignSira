// ============================================================
// CONFIDENCE SCORE (Điều 5, thành phần 5)
// Đo sức khỏe của neural-main-cell — KHÔNG import SmartLink/EventBus
// ============================================================

export interface NeuralMainConfidence {
  cellId: 'neural-main-cell';
  score: number;           // 0-100
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  metrics: {
    totalPermanentNodes: number;
    healthyNodesRatio: number;    // nodes weight >= 0.5 / total
    lastValidationAge: number;    // ms từ lần validate cuối
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
  score -= (1 - healthyRatio) * 30;       // Unhealthy nodes
  if (validationAge > dayMs) score -= 20; // Chưa validate hôm nay
  if (validationAge > 7 * dayMs) score -= 20; // Chưa validate tuần này
  score -= inconsistencyCount * 10;       // Mỗi inconsistency -10

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    cellId: 'neural-main-cell',
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
