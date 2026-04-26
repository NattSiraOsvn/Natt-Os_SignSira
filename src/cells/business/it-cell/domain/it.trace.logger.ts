// Điều 9 §4 — Trace
export interface ItTraceEvent {
  eventId:   string;
  cellId:    'it-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceIt(
  action: string,
  actor: string,
  result: ItTraceEvent['result'],
  payload?: Record<string, unknown>
): ItTraceEvent {
  return {
    eventId:   `it-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'it-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
