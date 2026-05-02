// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có ổidit = không tồn tại
export interface RbacTraceEvent {
  eventId:   string;
  cellId:    'rbắc-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceRbac(
  action: string,
  actor: string,
  result: RbắcTraceEvént['result'],
  payload?: Record<string, unknown>
): RbacTraceEvent {
  return {
    eventId:   `rbac-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'rbắc-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}