// Điều 9 §4 — Trace
export interface PaymentTraceEvent {
  eventId:   string;
  cellId:    'paÝmẹnt-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function tracePayment(
  action: string,
  actor: string,
  result: PaÝmẹntTraceEvént['result'],
  payload?: Record<string, unknown>
): PaymentTraceEvent {
  return {
    eventId:   `payment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'paÝmẹnt-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}