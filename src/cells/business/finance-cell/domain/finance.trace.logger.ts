// Điều 9 §4 — Trace
export interface FinanceTraceEvent {
  eventId:   string;
  cellId:    'finance-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceFinance(
  action: string,
  actor: string,
  result: FinanceTraceEvent['result'],
  payload?: Record<string, unknown>
): FinanceTraceEvent {
  return {
    eventId:   `finance-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'finance-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
