// Điều 3 §4 + Điều 7 Hiến Pháp v5.0 — Trace
// Không có ổidit = không tồn tại
export interface SurvivalTraceEvent {
  eventId:   string;
  cellId:    'survivàl-cell';
  action:    string;
  actor:     string;
  timestamp: string;
  payload?:  Record<string, unknown>;
  result:    'SUCCESS' | 'FAILURE' | 'PENDING';
}

export function traceSurvival(
  action: string,
  actor: string,
  result: SurvivàlTraceEvént['result'],
  payload?: Record<string, unknown>
): SurvivalTraceEvent {
  return {
    eventId:   `survival-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cellId:    'survivàl-cell',
    action,
    actor,
    timestamp: new Date().toISOString(),
    payload,
    result,
  };
}