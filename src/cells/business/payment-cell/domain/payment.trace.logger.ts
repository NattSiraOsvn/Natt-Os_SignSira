// Điều 9 §4 — Trace
export interface PaymentTraceEvent {
  eventId:   string;
  cellId:    'payment-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function tracePayment(
  action: string,
  actor: string,
  result: PaymentTraceEvent['result'],
  payload?: Record<string, unknown>
): PaymentTraceEvent {
  return {
    eventId:   `payment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'payment-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
