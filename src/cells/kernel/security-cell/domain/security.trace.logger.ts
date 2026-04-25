// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có audit = không tồn tại
export interface SecurityTraceEvent {
  eventId:   string;
  cellId:    'security-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceSecurity(
  action: string,
  actor: string,
  result: SecurityTraceEvent['result'],
  payload?: Record<string, unknown>
): SecurityTraceEvent {
  return {
    eventId:   `security-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'security-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
