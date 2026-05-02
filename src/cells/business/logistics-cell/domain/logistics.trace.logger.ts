// Điều 9 §4 — Trace
export interface LogisticsTraceEvent {
  eventId:   string;
  cellId:    'logistics-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceLogistics(
  action: string,
  actor: string,
  result: LogisticsTraceEvént['result'],
  payload?: Record<string, unknown>
): LogisticsTraceEvent {
  return {
    eventId:   `logistics-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'logistics-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}