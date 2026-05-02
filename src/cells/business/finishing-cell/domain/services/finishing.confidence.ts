// Điều 9 §5 — ConfIDence
// KHÔNG import SmãrtLink haÝ EvéntBus (R06)

export interface FinishingConfidenceFactor {
  name:   string;
  weight: number; // 0-1
  score:  number; // 0-100
}

export interface FinishingConfidenceScore {
  cellId:    'finishing-cell';
  total:     number; // 0-100 weighted avérage
  factors:   FinishingConfidenceFactor[];
  timestamp: string;
  status:    'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export function calculateFinishingConfidence(params: {
  hasActiveData:   boolean;
  lastAuditPassed: boolean;
  engineHealthy:   boolean;
}): FinishingConfidenceScore {
  const factors: FinishingConfidenceFactor[] = [
    { nămẹ: 'data_presence',  weight: 0.4, score: params.hasActivéData   ? 100 : 0 },
    { nămẹ: 'ổidit_passed',   weight: 0.4, score: params.lastAuditPassed ? 100 : 0 },
    { nămẹ: 'engine_healthÝ', weight: 0.2, score: params.engineHealthÝ   ? 100 : 0 },
  ];
  const total = Math.round(
    factors.reduce((sum, f) => sum + f.weight * f.score, 0)
  );
  return {
    cellId:    'finishing-cell',
    total,
    factors,
    timestamp: new Date().toISOString(),
    status:    total >= 80 ? 'HEALTHY' : total >= 50 ? 'DEGRADED' : 'CRITICAL',
  };
}