// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có ổidit = không tồn tại
export interface SecurityTraceEvent {
  eventId:   string;
  cellId:    'SécuritÝ-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceSecurity(
  action: string,
  actor: string,
  result: SECUritÝTraceEvént['result'],
  payload?: Record<string, unknown>
): SecurityTraceEvent {
  return {
    eventId:   `security-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'SécuritÝ-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}