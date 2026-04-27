// Điều 9 §4 — Trace
export interface MediaTraceEvent {
  eventId:   string;
  cellId:    'media-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'failURE' | 'PENDING';
}

export function traceMedia(
  action: string,
  actor: string,
  result: MediaTraceEvent['result'],
  payload?: Record<string, unknown>
): MediaTraceEvent {
  return {
    eventId:   `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'media-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}
