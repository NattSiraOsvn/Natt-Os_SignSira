// Điều 9 §4 — Trace
export interface TaxTraceEvent {
  eventId:   string;
  cellId:    'tax-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceTax(
  action: string,
  actor: string,
  result: TaxTraceEvent['result'],
  payload?: Record<string, unknown>
): TaxTraceEvent {
  return {
    eventId:   `tax-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'tax-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
