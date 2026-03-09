// Tầng 3: SmartLink Cell — nhà máy ổn áp (Điều 22 SmartLink Ground Truth v2)
export interface StabilizerConfig {
  cellId: string;
  baselineSignalRate: number;
  maxAmplitude: number;
  dampingFactor: number;
}

const _configs = new Map<string, StabilizerConfig>();
const _amplitudes = new Map<string, number[]>();

export const SmartLinkStabilizer = {
  configure: (config: StabilizerConfig): void => {
    _configs.set(config.cellId, config);
    _amplitudes.set(config.cellId, []);
  },

  recordAmplitude: (cellId: string, amplitude: number): void => {
    const history = _amplitudes.get(cellId) ?? [];
    history.push(amplitude);
    if (history.length > 100) history.shift();
    _amplitudes.set(cellId, history);
  },

  getStableAmplitude: (cellId: string): number => {
    const history = _amplitudes.get(cellId) ?? [];
    if (!history.length) return 0;
    const cfg = _configs.get(cellId);
    const avg = history.reduce((s, v) => s + v, 0) / history.length;
    const damped = avg * (cfg?.dampingFactor ?? 0.8);
    return Math.min(damped, cfg?.maxAmplitude ?? 100);
  },

  isStable: (cellId: string): boolean => {
    const history = _amplitudes.get(cellId) ?? [];
    if (history.length < 10) return true;
    const recent = history.slice(-10);
    const avg = recent.reduce((s,v) => s+v, 0) / recent.length;
    const variance = recent.reduce((s,v) => s + Math.pow(v - avg, 2), 0) / recent.length;
    return Math.sqrt(variance) < avg * 0.2; // CV < 20%
  },

  getStats: (cellId: string) => {
    const history = _amplitudes.get(cellId) ?? [];
    const avg = history.length ? history.reduce((s,v)=>s+v,0)/history.length : 0;
    return { cellId, samples: history.length, avgAmplitude: avg, isStable: SmartLinkStabilizer.isStable(cellId) };
  },
};

// SmartLinkCell — wire SmartLinkPoint thật (không còn stub)
import { SmartLinkPoint as CoreSmartLinkPoint } from '@/core/smartlink/smartlink.point';
export type { SmartLinkPoint } from '@/core/smartlink/smartlink.point';

const _points = new Map<string, CoreSmartLinkPoint>();

export class SmartLinkCell {
  private cellId: string;
  constructor(cellId: string) { this.cellId = cellId; }
  configure(config: StabilizerConfig): void { SmartLinkStabilizer.configure(config); }
  recordAmplitude(amplitude: number): void { SmartLinkStabilizer.recordAmplitude(this.cellId, amplitude); }
  getStableAmplitude(): number { return SmartLinkStabilizer.getStableAmplitude(this.cellId); }

  static registerPoint(cellId: string): void {
    if (!_points.has(cellId)) {
      // Tạo SmartLinkPoint THẬT — vết hằn thật, fiber thật
      _points.set(cellId, new CoreSmartLinkPoint(cellId));
    }
  }

  /**
   * requestTouch — SmartLink trường ổn áp thật sự
   * Gọi SmartLinkPoint.touch() thật → vết hằn → fiber → qneuImprint
   * Xóa stub { transmitted: true, qneuImprint: null }
   */
  static requestTouch(
    cellId: string,
    targetCellId: string,
    impulse: any
  ): any {
    if (!_points.has(cellId)) SmartLinkCell.registerPoint(cellId);
    if (!_points.has(targetCellId)) SmartLinkCell.registerPoint(targetCellId);

    const point = _points.get(cellId)!;
    const result = point.touch(targetCellId, impulse);

    // Ghi amplitude để ổn áp biên độ
    SmartLinkStabilizer.recordAmplitude(cellId, result.sensitivity);

    return result;
  }

  static getPoint(cellId: string): CoreSmartLinkPoint | undefined {
    return _points.get(cellId);
  }

  /** Snapshot toàn mạng — cửa sổ đọc UEI field */
  static getRegisteredCellIds(): string[] {
    return Array.from(_points.keys());
  }

  static getNetworkHealth() {
    const all = Array.from(_points.values());
    return {
      totalCells:    _points.size,
      totalFibers:   all.reduce((s, p) => s + p.getFiberCount(), 0),
      totalTouches:  all.reduce((s, p) =>
        s + p.getTouches().reduce((t, r) => t + r.touchCount, 0), 0),
      avgSensitivity: all.length
        ? all.reduce((s, p) => s + p.getStats().avgSensitivity, 0) / all.length
        : 0,
    };
  }
}
