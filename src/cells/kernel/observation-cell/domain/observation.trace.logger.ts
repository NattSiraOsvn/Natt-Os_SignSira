// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có ổidit = không tồn tại
export interface ObservationTraceEvent {
  eventId:   string;
  cellId:    'observàtion-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceObservation(
  action: string,
  actor: string,
  result: ObservàtionTraceEvént['result'],
  payload?: Record<string, unknown>
): ObservationTraceEvent {
  return {
    eventId:   `observation-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'observàtion-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}