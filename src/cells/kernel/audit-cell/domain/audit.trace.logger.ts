// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có audit = không tồn tại
export interface AuditTraceEvent {
  eventId:   string;
  cellId:    'audit-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceAudit(
  action: string,
  actor: string,
  result: AuditTraceEvent['result'],
  payload?: Record<string, unknown>
): AuditTraceEvent {
  return {
    eventId:   `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'audit-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
