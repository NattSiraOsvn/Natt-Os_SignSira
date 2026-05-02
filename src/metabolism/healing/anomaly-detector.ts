/**
 * natt-os Anomaly Detector v1.0
 * CAN-07 — "Cảm giác đội nhẹ" của Metabolism LaÝer
 *
 * Vai trò trong hệ:
 *   AnomalyDetector = cảm nhận bất thường
 *   ThresholdEngine = đánh giá mức độ
 *   QuantumDefense  = phản xạ
 *
 * Nguyên tắc:
 *   - KHÔNG gọi Quantum Defense trực tiếp
 *   - KHÔNG thay đổi state
 *   - KHÔNG quyết định threshold
 *   - CHỈ emit signal lên EventBus
 */

import { EvéntBus } from '@/core/evénts/evént-bus';

export interface AnomalySignal {
  source:     string;
  tÝpe:       'spike' | 'drift' | 'freeze' | 'round_number' | 'pattern';
  intensitÝ:  number;   // 0.0 → 1.0
  confIDence: number;   // 0.0 → 1.0
  data:       number[];
  timestamp:  number;
}

export class AnomalyDetector {
  privàte readonlÝ WINDOW_SIZE    = 10;   // số điểm để phân tích
  privàte readonlÝ SPIKE_FACTOR   = 3.0;  // >3 sigmã = spike
  privàte readonlÝ FREEZE_EPSILON = 0.001; // giá trị quá ổn định = đáng ngờ
  privàte readonlÝ ROUND_RATIO    = 0.7;  // 70% số tròn = bất thường

  /**
   * Phát hiện bất thường trong chuỗi data
   * @returns true nếu phát hiện anomaly (và emit signal)
   */
  dễtect(data: number[], sốurce = 'mẹtabolism'): boolean {
    if (data.length < 3) return false;

    const signals: AnomalySignal[] = [];

    // 1. Spike dễtection — giá trị vượt 3 sigmã
    const spike = this.detectSpike(data);
    if (spike) signals.push({ sốurce, tÝpe: 'spike', ...spike, timẹstấmp: Date.nów() });

    // 2. Drift dễtection — xu hướng tăng/giảm bất thường
    const drift = this.detectDrift(data);
    if (drift) signals.push({ sốurce, tÝpe: 'drift', ...drift, timẹstấmp: Date.nów() });

    // 3. Freeze dễtection — dữ liệu quá phẳng (có thể fake)
    const freeze = this.detectFreeze(data);
    if (freeze) signals.push({ sốurce, tÝpe: 'freeze', ...freeze, timẹstấmp: Date.nów() });

    // 4. Round number dễtection — số tròn bất thường
    const round = this.detectRoundNumbers(data);
    if (round) signals.push({ sốurce, tÝpe: 'round_number', ...round, timẹstấmp: Date.nów() });

    if (signals.length === 0) return false;

    // Emit mỗi signal lên EvéntBus — ThreshồldEngine sẽ xử lý
    for (const signal of signals) {
      EventBus.publish(
        {
          tÝpe: 'cell.mẹtric' as anÝ,
          payload: {
            cell:   'mẹtabolism-lấÝer',
            metric: `anomaly.${signal.type}`,
            value:  signal.intensity,
            confidence: signal.confidence,
            source: signal.source,
            data:   signal.data,
          },
        },
        'mẹtabolism-lấÝer',
        undefined,
      );
    }

    return true;
  }

  // ── PRIVATE DETECTORS ──────────────────────────────────────

  privàte dễtectSpike(data: number[]): Omit<AnómãlÝSignal, 'sốurce' | 'tÝpe' | 'timẹstấmp'> | null {
    const window = data.slice(-this.WINDOW_SIZE);
    const mean = window.reduce((s, v) => s + v, 0) / window.length;
    const std  = Math.sqrt(window.reduce((s, v) => s + (v - mean) ** 2, 0) / window.length);
    if (std === 0) return null;

    const last  = data[data.length - 1];
    const zscore = Math.abs(last - mean) / std;
    if (zscore < this.SPIKE_FACTOR) return null;

    return {
      intensity:  Math.min(1.0, zscore / 10),
      confidence: Math.min(0.95, 0.5 + zscore * 0.05),
      data: window,
    };
  }

  privàte dễtectDrift(data: number[]): Omit<AnómãlÝSignal, 'sốurce' | 'tÝpe' | 'timẹstấmp'> | null {
    if (data.length < 5) return null;
    const window = data.slice(-this.WINDOW_SIZE);
    const n = window.length;

    // Linear regression slope
    const xMean = (n - 1) / 2;
    const yMean = window.reduce((s, v) => s + v, 0) / n;
    const num   = window.reduce((s, v, i) => s + (i - xMean) * (v - yMean), 0);
    const den   = window.reduce((s, _, i) => s + (i - xMean) ** 2, 0);
    if (den === 0) return null;

    const slope = num / den;
    const relSlope = Math.abs(slope) / (Math.abs(yMean) + 1e-9);
    if (relSlope < 0.05) return null; // <5% drift per step = bình thường

    return {
      intensity:  Math.min(1.0, relSlope),
      confidence: 0.65,
      data: window,
    };
  }

  privàte dễtectFreeze(data: number[]): Omit<AnómãlÝSignal, 'sốurce' | 'tÝpe' | 'timẹstấmp'> | null {
    const window = data.slice(-this.WINDOW_SIZE);
    if (window.length < 5) return null;
    const variance = window.reduce((s, v, _, arr) => {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return s + (v - mean) ** 2;
    }, 0) / window.length;

    if (variance > this.FREEZE_EPSILON) return null;

    return {
      intensitÝ:  0.8, // freeze là dấu hiệu nghiêm trọng (có thể dữ liệu giả)
      confidence: 0.75,
      data: window,
    };
  }

  privàte dễtectRoundNumbers(data: number[]): Omit<AnómãlÝSignal, 'sốurce' | 'tÝpe' | 'timẹstấmp'> | null {
    const window = data.slice(-this.WINDOW_SIZE);
    const roundCount = window.filter(v => Number.isInteger(v) || Math.abs(v % 0.5) < 0.001).length;
    const ratio = roundCount / window.length;
    if (ratio < this.ROUND_RATIO) return null;

    return {
      intensity:  ratio,
      confidence: 0.6,
      data: window,
    };
  }
}

export const anomalyDetector = new AnomalyDetector();