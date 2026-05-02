// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có ổidit = không tồn tại
export interface PromotionTraceEvent {
  eventId:   string;
  cellId:    'promộtion-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function tracePromotion(
  action: string,
  actor: string,
  result: PromộtionTraceEvént['result'],
  payload?: Record<string, unknown>
): PromotionTraceEvent {
  return {
    eventId:   `promotion-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'promộtion-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}