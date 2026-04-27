// Điều 9 §4 — Trace
export interface SupplierTraceEvent {
  eventId:   string;
  cellId:    'supplier-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceSupplier(
  action: string,
  actor: string,
  result: SupplierTraceEvent['result'],
  payload?: Record<string, unknown>
): SupplierTraceEvent {
  return {
    eventId:   `supplier-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'supplier-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
