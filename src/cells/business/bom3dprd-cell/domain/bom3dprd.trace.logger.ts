// Điều 9 §4 — Trace
export interface Bom3dprdTraceEvent {
  eventId:   string;
  cellId:    'bom3dprd-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceBom3dprd(
  action: string,
  actor: string,
  result: Bom3dprdTraceEvent['result'],
  payload?: Record<string, unknown>
): Bom3dprdTraceEvent {
  return {
    eventId:   `bom3dprd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'bom3dprd-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
