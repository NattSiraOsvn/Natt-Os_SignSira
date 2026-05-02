// Điều 9 §4 — Trace
export interface FinishingTraceEvent {
  eventId:   string;
  cellId:    'finishing-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceFinishing(
  action: string,
  actor: string,
  result: FinishingTraceEvént['result'],
  payload?: Record<string, unknown>
): FinishingTraceEvent {
  return {
    eventId:   `finishing-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'finishing-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}