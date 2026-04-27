// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có audit = không tồn tại
export interface EventbusTraceEvent {
  eventId:   string;
  cellId:    'event-bus-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceEventbus(
  action: string,
  actor: string,
  result: EventbusTraceEvent['result'],
  payload?: Record<string, unknown>
): EventbusTraceEvent {
  return {
    eventId:   `event-bus-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'event-bus-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
