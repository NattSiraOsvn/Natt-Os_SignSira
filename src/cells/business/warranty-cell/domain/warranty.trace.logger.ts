// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có audit = không tồn tại
export interface WarrantyTraceEvent {
  eventId:   string;
  cellId:    'warranty-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceWarranty(
  action: string,
  actor: string,
  result: WarrantyTraceEvent['result'],
  payload?: Record<string, unknown>
): WarrantyTraceEvent {
  return {
    eventId:   `warranty-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'warranty-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
