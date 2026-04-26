// Điều 9 §4 — Trace
export interface CommsTraceEvent {
  eventId:   string;
  cellId:    'comms-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceComms(
  action: string,
  actor: string,
  result: CommsTraceEvent['result'],
  payload?: Record<string, unknown>
): CommsTraceEvent {
  return {
    eventId:   `comms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'comms-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
