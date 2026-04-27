// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có audit = không tồn tại
export interface AnalyticsTraceEvent {
  eventId:   string;
  cellId:    'analytics-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceAnalytics(
  action: string,
  actor: string,
  result: AnalyticsTraceEvent['result'],
  payload?: Record<string, unknown>
): AnalyticsTraceEvent {
  return {
    eventId:   `analytics-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'analytics-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
