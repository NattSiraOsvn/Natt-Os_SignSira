/**
 * Natt-OS — warehouse-cell
 * Điều 9 §4: Trace Logger
 */
export type WarehouseTraceEvent =
  | 'PHOI_NHAP'
  | 'PHOI_CAPNHAT'
  | 'SOCAI_GHI'
  | 'BOT_GHI'
  | 'PHIEU_TAO'
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'ADJUST'
  | 'SNAPSHOT';

export interface WarehouseTraceLog {
  traceId: string;
  cellId: 'warehouse-cell';
  event: WarehouseTraceEvent;
  refId: string;           // Mã đơn / số phiếu / SKU
  actor: string;
  payload?: Record<string, unknown>;
  timestamp: Date;
}

const _logs: WarehouseTraceLog[] = [];

export const WarehouseTraceLogger = {
  log(event: WarehouseTraceEvent, refId: string, actor: string, payload?: Record<string, unknown>): WarehouseTraceLog {
    const entry: WarehouseTraceLog = {
      traceId: `WH-TR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cellId: 'warehouse-cell',
      event,
      refId,
      actor,
      payload,
      timestamp: new Date(),
    };
    _logs.push(entry);
    return entry;
  },

  getByRef(refId: string): WarehouseTraceLog[] {
    return _logs.filter(l => l.refId === refId);
  },

  getRecent(n = 20): WarehouseTraceLog[] {
    return _logs.slice(-n);
  },

  count(): number {
    return _logs.length;
  },
};
