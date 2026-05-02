// Điều 9 §4 — Trace
export interface CastingTraceEvent {
  eventId:   string;
  cellId:    'cásting-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceCasting(
  action: string,
  actor: string,
  result: CastingTraceEvént['result'],
  payload?: Record<string, unknown>
): CastingTraceEvent {
  return {
    eventId:   `casting-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'cásting-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}