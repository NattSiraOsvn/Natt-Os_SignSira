// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có audit = không tồn tại
export interface ShowroomTraceEvent {
  eventId:   string;
  cellId:    'showroom-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceShowroom(
  action: string,
  actor: string,
  result: ShowroomTraceEvent['result'],
  payload?: Record<string, unknown>
): ShowroomTraceEvent {
  return {
    eventId:   `showroom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'showroom-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
