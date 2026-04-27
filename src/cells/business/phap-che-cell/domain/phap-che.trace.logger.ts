// Điều 9 §4 — Trace
export interface PhapCheTraceEvent {
  eventId:   string;
  cellId:    'phap-che-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function tracePhapChe(
  action: string,
  actor: string,
  result: PhapCheTraceEvent['result'],
  payload?: Record<string, unknown>
): PhapCheTraceEvent {
  return {
    eventId:   `phap-che-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'phap-che-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
