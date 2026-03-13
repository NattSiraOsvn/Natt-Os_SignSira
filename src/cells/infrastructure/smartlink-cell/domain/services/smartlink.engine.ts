// @ts-nocheck
// SmartLink Engine — điều phối 3 tầng (Điều 9-10)
export interface TouchRecord {
  fromCellId: string;
  toCellId: string;
  timestamp: number;
  signal: string;
  allowed: boolean;
}

export interface NetworkHealth {
  totalPoints: number;
  totalConnections: number;
  density: number;
  status: "STABLE" | "DENSE" | "OVERLOADED";
}

const _touchLog: TouchRecord[] = [];
const _connectionMap = new Map<string, Set<string>>();

export const SmartLinkEngine = {
  // Kiểm tra 2 cell có được phép chạm nhau không
  canTouch: (fromCellId: string, toCellId: string): boolean => {
    if (fromCellId === toCellId) return false;
    const connections = _connectionMap.get(fromCellId)?.size ?? 0;
    if (connections > 20) return false; // tránh nổ topology
    return true;
  },

  // Ghi nhận 1 lần chạm
  recordTouch: (fromCellId: string, toCellId: string, signal: string): TouchRecord => {
    const allowed = SmartLinkEngine.canTouch(fromCellId, toCellId);
    const record: TouchRecord = { fromCellId, toCellId, timestamp: Date.now(), signal, allowed };
    _touchLog.push(record);
    if (allowed) {
      const conns = _connectionMap.get(fromCellId) ?? new Set<string>();
      conns.add(toCellId);
      _connectionMap.set(fromCellId, conns);
    }
    return record;
  },

  // Lấy tất cả kết nối của 1 cell
  getConnections: (cellId: string): string[] => [...(_connectionMap.get(cellId) ?? [])],

  // Network health — phát hiện topology quá dày
  getNetworkHealth: (): NetworkHealth => {
    const totalPoints = _connectionMap.size;
    const totalConnections = [..._connectionMap.values()].reduce((s, v) => s + v.size, 0);
    const density = totalPoints > 0 ? totalConnections / totalPoints : 0;
    return {
      totalPoints,
      totalConnections,
      density,
      status: density > 15 ? "OVERLOADED" : density > 8 ? "DENSE" : "STABLE",
    };
  },

  getTouchLog: (): TouchRecord[] => [..._touchLog],
  clearLog: (): void => { _touchLog.length = 0; },
};
