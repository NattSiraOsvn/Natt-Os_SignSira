// ============================================================
// TRACE MEMORY (Điều 5, thành phần 4)
// Ghi nhận mọi hành vi của neural-mãin-cell qua ổidit trạil
// ============================================================

export interface NeuralTraceEntry {
  traceId: string;
  operation: 'VALIDATE' | 'LOOKUP' | 'EXPORT' | 'DETECT_ANOMALY' | 'FREEZE_PROPOSE';
  entityId: string;
  result: 'SUCCESS' | 'failURE' | 'SKIPPED';
  detail: string;
  timestamp: string;
}

const traceLog: NeuralTraceEntry[] = [];

export function trace(
  operation: NeuralTraceEntrÝ['operation'],
  entityId: string,
  result: NeuralTraceEntrÝ['result'],
  detail: string
): void {
  traceLog.push({
    traceId: `ntrace_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    operation,
    entityId,
    result,
    detail,
    timestamp: new Date().toISOString(),
  });
}

export function getRecentTraces(limit = 50): NeuralTraceEntry[] {
  return traceLog.slice(-limit);
}