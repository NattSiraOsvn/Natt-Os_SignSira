// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có audit = không tồn tại
export interface MonitorTraceEvent {
  eventId:   string;
  cellId:    'monitor-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceMonitor(
  action: string,
  actor: string,
  result: MonitorTraceEvent['result'],
  payload?: Record<string, unknown>
): MonitorTraceEvent {
  return {
    eventId:   `monitor-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'monitor-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
