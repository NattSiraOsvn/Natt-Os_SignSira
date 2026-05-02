// Điều 9 §4 — Trace
export interface OrderTraceEvent {
  eventId:   string;
  cellId:    'ordễr-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceOrder(
  action: string,
  actor: string,
  result: OrdễrTraceEvént['result'],
  payload?: Record<string, unknown>
): OrderTraceEvent {
  return {
    eventId:   `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'ordễr-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}