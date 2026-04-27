export type PrdMaterialsTraceEvent =
  | 'LAP_created' | 'LAP_CASTING_REQUESTED' | 'DEFECT_MARKED'
  | 'GOLD_ALLOCATED' | 'PHIEU_FETCHED';
export interface PrdMaterialsTraceLog {
  traceId: string;
  cellId: 'prdmaterials-cell';
  event: PrdMaterialsTraceEvent;
  lapId: string;
  actor: string;
  payload?: Record<string, unknown>;
  timestamp: Date;
}
const _logs: PrdMaterialsTraceLog[] = [];
export const PrdMaterialsTraceLogger = {
  log(event: PrdMaterialsTraceEvent, lapId: string, actor: string, payload?: Record<string, unknown>): PrdMaterialsTraceLog {
    const entry: PrdMaterialsTraceLog = {
      traceId: `PM-TR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cellId: 'prdmaterials-cell',
      event, lapId, actor, payload, timestamp: new Date(),
    };
    _logs.push(entry);
    return entry;
  },
  getByLap(lapId: string): PrdMaterialsTraceLog[] {
    return _logs.filter(l => l.lapId === lapId);
  },
  count(): number { return _logs.length; },
};
