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
