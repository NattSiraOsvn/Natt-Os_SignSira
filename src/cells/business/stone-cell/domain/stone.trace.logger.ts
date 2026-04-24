// Điều 9 §4 — Trace
export interface StoneTraceEvent {
  eventId:   string;
  cellId:    'stone-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceStone(
  action: string,
  actor: string,
  result: StoneTraceEvent['result'],
  payload?: Record<string, unknown>
): StoneTraceEvent {
  return {
    eventId:   `stone-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'stone-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
