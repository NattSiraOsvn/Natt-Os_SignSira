// Điều 3 §5 Hiến Pháp v5.0 — Confidence
// KHÔNG import SmartLink hay EventBus (Điều 4)

export interface EventbusConfidenceFactor {
  name:   string;
  weight: number; // 0-1
  score:  number; // 0-100
}

export interface EventbusConfidenceScore {
  cellId:    'event-bus-cell';
  total:     number; // 0-100 weighted average
  factors:   EventbusConfidenceFactor[];
  timestamp: string;
  status:    'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export function calculateEventbusConfidence(params: {
  hasActiveData:   boolean;
  lastAuditPassed: boolean;
  engineHealthy:   boolean;
}): EventbusConfidenceScore {
  const factors: EventbusConfidenceFactor[] = [
    { name: 'data_presence',  weight: 0.4, score: params.hasActiveData   ? 100 : 0 },
    { name: 'audit_passed',   weight: 0.4, score: params.lastAuditPassed ? 100 : 0 },
    { name: 'engine_healthy', weight: 0.2, score: params.engineHealthy   ? 100 : 0 },
  ];
  const total = Math.round(
    factors.reduce((sum, f) => sum + f.weight * f.score, 0)
  );
  return {
    cellId:    'event-bus-cell',
    total,
    factors,
    timestamp: new Date().toISOString(),
    status:    total >= 80 ? 'HEALTHY' : total >= 50 ? 'DEGRADED' : 'CRITICAL',
  };
}
