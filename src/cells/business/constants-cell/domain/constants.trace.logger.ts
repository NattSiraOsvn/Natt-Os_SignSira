// Điều 9 §4 — Trace
export interface ConstantsTraceEvent {
  eventId:   string;
  cellId:    'constants-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceConstants(
  action: string,
  actor: string,
  result: ConstantsTraceEvent['result'],
  payload?: Record<string, unknown>
): ConstantsTraceEvent {
  return {
    eventId:   `constants-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'constants-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
