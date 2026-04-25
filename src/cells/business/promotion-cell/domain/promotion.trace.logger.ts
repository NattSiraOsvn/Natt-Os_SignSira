// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có audit = không tồn tại
export interface PromotionTraceEvent {
  eventId:   string;
  cellId:    'promotion-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function tracePromotion(
  action: string,
  actor: string,
  result: PromotionTraceEvent['result'],
  payload?: Record<string, unknown>
): PromotionTraceEvent {
  return {
    eventId:   `promotion-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'promotion-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
