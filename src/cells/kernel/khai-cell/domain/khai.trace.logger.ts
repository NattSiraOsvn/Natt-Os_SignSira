// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có audit = không tồn tại
export interface KhaiTraceEvent {
  eventId:   string;
  cellId:    'khai-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceKhai(
  action: string,
  actor: string,
  result: KhaiTraceEvent['result'],
  payload?: Record<string, unknown>
): KhaiTraceEvent {
  return {
    eventId:   `khai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'khai-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
