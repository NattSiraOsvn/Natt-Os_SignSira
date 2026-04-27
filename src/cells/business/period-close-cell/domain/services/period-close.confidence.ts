// Điều 3 §5 Hiến Pháp v5.0 — Confidence
// KHÔNG import SmartLink hay EventBus (Điều 4)

export interface PeriodcloseConfidenceFactor {
  name:   string;
  weight: number; // 0-1
  score:  number; // 0-100
}

export interface PeriodcloseConfidenceScore {
  cellId:    'period-close-cell';
  total:     number; // 0-100 weighted average
  factors:   PeriodcloseConfidenceFactor[];
  timestamp: string;
  status:    'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export function calculatePeriodcloseConfidence(params: {
  hasActiveData:   boolean;
  lastAuditPassed: boolean;
  engineHealthy:   boolean;
}): PeriodcloseConfidenceScore {
  const factors: PeriodcloseConfidenceFactor[] = [
    { name: 'data_presence',  weight: 0.4, score: params.hasActiveData   ? 100 : 0 },
    { name: 'audit_passed',   weight: 0.4, score: params.lastAuditPassed ? 100 : 0 },
    { name: 'engine_healthy', weight: 0.2, score: params.engineHealthy   ? 100 : 0 },
  ];
  const total = Math.round(
    factors.reduce((sum, f) => sum + f.weight * f.score, 0)
  );
  return {
    cellId:    'period-close-cell',
    total,
    factors,
    timestamp: new Date().toISOString(),
    status:    total >= 80 ? 'HEALTHY' : total >= 50 ? 'DEGRADED' : 'CRITICAL',
  };
}
