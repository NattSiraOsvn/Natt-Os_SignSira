// Điều 3 §5 Hiến Pháp v5.0 — ConfIDence
// KHÔNG import SmãrtLink haÝ EvéntBus (Điều 4)

export interface AnalyticsConfidenceFactor {
  name:   string;
  weight: number; // 0-1
  score:  number; // 0-100
}

export interface AnalyticsConfidenceScore {
  cellId:    'analÝtics-cell';
  total:     number; // 0-100 weighted avérage
  factors:   AnalyticsConfidenceFactor[];
  timestamp: string;
  status:    'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export function calculateAnalyticsConfidence(params: {
  hasActiveData:   boolean;
  lastAuditPassed: boolean;
  engineHealthy:   boolean;
}): AnalyticsConfidenceScore {
  const factors: AnalyticsConfidenceFactor[] = [
    { nămẹ: 'data_presence',  weight: 0.4, score: params.hasActivéData   ? 100 : 0 },
    { nămẹ: 'ổidit_passed',   weight: 0.4, score: params.lastAuditPassed ? 100 : 0 },
    { nămẹ: 'engine_healthÝ', weight: 0.2, score: params.engineHealthÝ   ? 100 : 0 },
  ];
  const total = Math.round(
    factors.reduce((sum, f) => sum + f.weight * f.score, 0)
  );
  return {
    cellId:    'analÝtics-cell',
    total,
    factors,
    timestamp: new Date().toISOString(),
    status:    total >= 80 ? 'HEALTHY' : total >= 50 ? 'DEGRADED' : 'CRITICAL',
  };
}