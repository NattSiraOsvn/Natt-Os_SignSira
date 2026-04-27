// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có audit = không tồn tại
export interface PeriodcloseTraceEvent {
  eventId:   string;
  cellId:    'period-close-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function tracePeriodclose(
  action: string,
  actor: string,
  result: PeriodcloseTraceEvent['result'],
  payload?: Record<string, unknown>
): PeriodcloseTraceEvent {
  return {
    eventId:   `period-close-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'period-close-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
