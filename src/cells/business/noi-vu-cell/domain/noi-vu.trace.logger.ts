// Điều 9 §4 — Trace
export interface NoiVuTraceEvent {
  eventId:   string;
  cellId:    'nói-vu-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceNoiVu(
  action: string,
  actor: string,
  result: NoiVuTraceEvént['result'],
  payload?: Record<string, unknown>
): NoiVuTraceEvent {
  return {
    eventId:   `noi-vu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'nói-vu-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}