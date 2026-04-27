// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có audit = không tồn tại
export interface BuybackTraceEvent {
  eventId:   string;
  cellId:    'buyback-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceBuyback(
  action: string,
  actor: string,
  result: BuybackTraceEvent['result'],
  payload?: Record<string, unknown>
): BuybackTraceEvent {
  return {
    eventId:   `buyback-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'buyback-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
