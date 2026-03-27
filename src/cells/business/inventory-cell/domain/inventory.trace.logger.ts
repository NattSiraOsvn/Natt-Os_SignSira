export type InventoryTraceEvent =
  | 'STOCK_RECEIVED' | 'STOCK_ISSUED' | 'STOCK_ADJUSTED'
  | 'MONTH_END_CLOSED' | 'RECONCILE_RUN';
export interface InventoryTraceLog {
  traceId: string;
  cellId: 'inventory-cell';
  event: InventoryTraceEvent;
  refId: string;
  actor: string;
  payload?: Record<string, unknown>;
  timestamp: Date;
}
const _logs: InventoryTraceLog[] = [];
export const InventoryTraceLogger = {
  log(event: InventoryTraceEvent, refId: string, actor: string, payload?: Record<string, unknown>): InventoryTraceLog {
    const entry: InventoryTraceLog = {
      traceId: `INV-TR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cellId: 'inventory-cell',
      event, refId, actor, payload, timestamp: new Date(),
    };
    _logs.push(entry);
    return entry;
  },
  getByRef(refId: string): InventoryTraceLog[] { return _logs.filter(l => l.refId === refId); },
  count(): number { return _logs.length; },
};
