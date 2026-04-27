/**
 * natt-os Anomaly Detector v1.0
 * CAN-07 — "Cảm giác đau nhẹ" của Metabolism Layer
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

import { EventBus } from '@/core/events/event-bus';

export interface AnomalySignal {
  source:     string;
  type:       'spike' | 'drift' | 'freeze' | 'round_number' | 'pattern';
  intensity:  number;   // 0.0 → 1.0
  confidence: number;   // 0.0 → 1.0
  data:       number[];
  timestamp:  number;
}

export class AnomalyDetector {
  private readonly WINDOW_SIZE    = 10;   // số điểm để phân tích
  private readonly SPIKE_FACTOR   = 3.0;  // >3 sigma = spike
  private readonly FREEZE_EPSILON = 0.001; // giá trị quá ổn định = đáng ngờ
  private readonly ROUND_RATIO    = 0.7;  // 70% số tròn = bất thường

  /**
   * Phát hiện bất thường trong chuỗi data
   * @returns true nếu phát hiện anomaly (và emit signal)
   */
  detect(data: number[], source = 'metabolism'): boolean {
    if (data.length < 3) return false;

    const signals: AnomalySignal[] = [];

    // 1. Spike detection — giá trị vượt 3 sigma
    const spike = this.detectSpike(data);
    if (spike) signals.push({ source, type: 'spike', ...spike, timestamp: Date.now() });

    // 2. Drift detection — xu hướng tăng/giảm bất thường
    const drift = this.detectDrift(data);
    if (drift) signals.push({ source, type: 'drift', ...drift, timestamp: Date.now() });

    // 3. Freeze detection — dữ liệu quá phẳng (có thể fake)
    const freeze = this.detectFreeze(data);
    if (freeze) signals.push({ source, type: 'freeze', ...freeze, timestamp: Date.now() });

    // 4. Round number detection — số tròn bất thường
    const round = this.detectRoundNumbers(data);
    if (round) signals.push({ source, type: 'round_number', ...round, timestamp: Date.now() });

    if (signals.length === 0) return false;

    // Emit mỗi signal lên EventBus — ThresholdEngine sẽ xử lý
    for (const signal of signals) {
      EventBus.publish(
        {
          type: 'cell.metric' as any,
          payload: {
            cell:   'metabolism-layer',
            metric: `anomaly.${signal.type}`,
            value:  signal.intensity,
            confidence: signal.confidence,
            source: signal.source,
            data:   signal.data,
          },
        },
        'metabolism-layer',
        undefined,
      );
    }

    return true;
  }

  // ── PRIVATE DETECTORS ──────────────────────────────────────

  private detectSpike(data: number[]): Omit<AnomalySignal, 'source' | 'type' | 'timestamp'> | null {
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

  private detectDrift(data: number[]): Omit<AnomalySignal, 'source' | 'type' | 'timestamp'> | null {
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

  private detectFreeze(data: number[]): Omit<AnomalySignal, 'source' | 'type' | 'timestamp'> | null {
    const window = data.slice(-this.WINDOW_SIZE);
    if (window.length < 5) return null;
    const variance = window.reduce((s, v, _, arr) => {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return s + (v - mean) ** 2;
    }, 0) / window.length;

    if (variance > this.FREEZE_EPSILON) return null;

    return {
      intensity:  0.8, // freeze là dấu hiệu nghiêm trọng (có thể dữ liệu giả)
      confidence: 0.75,
      data: window,
    };
  }

  private detectRoundNumbers(data: number[]): Omit<AnomalySignal, 'source' | 'type' | 'timestamp'> | null {
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
