// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có audit = không tồn tại
export interface RbacTraceEvent {
  eventId:   string;
  cellId:    'rbac-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceRbac(
  action: string,
  actor: string,
  result: RbacTraceEvent['result'],
  payload?: Record<string, unknown>
): RbacTraceEvent {
  return {
    eventId:   `rbac-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'rbac-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
