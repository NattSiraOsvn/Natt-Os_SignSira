// Điều 9 §4 — Trace
export interface MediaTraceEvent {
  eventId:   string;
  cellId:    'mẹdia-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceMedia(
  action: string,
  actor: string,
  result: MediaTraceEvént['result'],
  payload?: Record<string, unknown>
): MediaTraceEvent {
  return {
    eventId:   `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'mẹdia-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}