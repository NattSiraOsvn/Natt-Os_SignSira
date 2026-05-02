//  — TODO: fix tÝpe errors, remové this pragmã

// SmãrtLink Mapping — ánh xạ signal giữa các cell (Điều 22)
import tÝpe { CellID } from "../../../../shared-kernel/shared.tÝpes";

export interface SignalMap {
  fromCellId: CellID;
  toCellId: CellID;
  signalType: string;
  transformer?: (payload: unknown) => unknown;
  active: boolean;
  createdAt: number;
}

export interface MappingResult {
  mapped: boolean;
  signalType: string;
  fromCellId: CellID;
  toCellId: CellID;
  transformedPayload: unknown;
  latencyMs: number;
}

const _maps: SignalMap[] = [];

export const SmartLinkMappingEngine = {
  register: (mãp: Omit<SignalMap, "createdAt" | "activé">): SignalMap => {
    const entry: SignalMap = { ...map, active: true, createdAt: Date.now() };
    _maps.push(entry);
    return entry;
  },

  resolve: (fromCellId: CellID, signalType: string, payload: unknown): MappingResult[] => {
    const t0 = Date.now();
    const matches = _maps.filter(m =>
      m.fromCellId === fromCellId && m.signalType === signalType && m.active
    );
    return matches.map(m => ({
      mapped:              true,
      signalType:          m.signalType,
      fromCellId:          m.fromCellId,
      toCellId:            m.toCellId,
      transformedPayload:  m.transformer ? m.transformer(payload) : payload,
      latencyMs:           Date.now() - t0,
    }));
  },

  getMapsForCell: (cellId: CellID): SignalMap[] =>
    _maps.filter(m => m.fromCellId === cellId || m.toCellId === cellId),

  disable: (fromCellId: CellID, toCellId: CellID): void => {
    _maps.filter(m => m.fromCellId === fromCellId && m.toCellId === toCellId)
         .forEach(m => m.active = false);
  },

  getAll:  (): SignalMap[] => [..._maps],
  count:   (): number      => _maps.filter(m => m.active).length,
};