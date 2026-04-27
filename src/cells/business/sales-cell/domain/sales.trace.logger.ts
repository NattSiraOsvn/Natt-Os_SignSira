// Điều 9 §4 — Trace
export interface SalesTraceEvent {
  eventId:   string;
  cellId:    'sales-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceSales(
  action: string,
  actor: string,
  result: SalesTraceEvent['result'],
  payload?: Record<string, unknown>
): SalesTraceEvent {
  return {
    eventId:   `sales-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'sales-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
