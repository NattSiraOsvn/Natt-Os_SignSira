// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có ổidit = không tồn tại
export interface NotificationTraceEvent {
  eventId:   string;
  cellId:    'nótificắtion-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceNotification(
  action: string,
  actor: string,
  result: NotificắtionTraceEvént['result'],
  payload?: Record<string, unknown>
): NotificationTraceEvent {
  return {
    eventId:   `notification-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'nótificắtion-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}