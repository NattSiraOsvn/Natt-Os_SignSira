 — TODO: fix type errors, remove this pragma

/**
 * dust-recovery.engine.ts — Hao hụt vật lý trong SX nữ trang
 * SPEC: Can P5 | Ground truth: Tâm Luxury production data
 */

import { EventBus } from '../../../../../core/events/event-bus';
import { typedEmit } from '../../../../../core/events/typed-eventbus';

export type GoldMaterial = 'gold18k' | 'gold14k';

export interface DustInput {
  batchId:        string;
  workerId:       string;
  material:       GoldMaterial;
  inputWeight:    number;   // gram — KHÔNG làm tròn sớm
  outputWeight:   number;   // gram
  recoveredDust?: number;   // gram — bột thu được
  timestamp:      number;
}

export interface DustResult {
  batchId:       string;
  workerId:      string;
  material:      GoldMaterial;
  dust:          number;    // inputWeight - outputWeight
  lossRate:      number;    // dust / inputWeight
  recoveryRate:  number;    // recoveredDust / dust
  isAnomaly:     boolean;
  anomalyReason?: string;
  confidence:    number;
  timestamp:     number;
}

// Baseline từ ngành nữ trang thực tế
const LOSS_BASELINE: Record<GoldMaterial, { min: number; max: number }> = {
  gold18k: { min: 0.01, max: 0.03 },   // 1%–3%
  gold14k: { min: 0.015, max: 0.04 },  // 1.5%–4%
};

export class DustRecoveryEngine {
  /**
   * Tính hao hụt theo từng lệnh SX — KHÔNG gộp batch
   */
  compute(input: DustInput): DustResult {
    const { batchId, workerId, material, inputWeight, outputWeight, recoveredDust, timestamp } = input;

    if (inputWeight <= 0) throw new Error(`[DustRecovery] inputWeight phai > 0 (batch: ${batchId})`);
    if (outputWeight < 0) throw new Error(`[DustRecovery] outputWeight khong the am (batch: ${batchId})`);

    const dust         = inputWeight - outputWeight;
    const lossRate     = dust / inputWeight;
    const recoveryRate = (recoveredDust ?? 0) > 0 ? (recoveredDust! / dust) : 0;

    const baseline = LOSS_BASELINE[material];
    let isAnomaly  = false;
    let anomalyReason: string | undefined;

    if (lossRate > baseline.max) {
      isAnomaly     = true;
      anomalyReason = `lossRate ${(lossRate * 100).toFixed(2)}% vuot baseline max ${(baseline.max * 100)}% (${material})`;
    } else if (lossRate < baseline.min * 0.5) {
      // Quá thấp bất thường — có thể dữ liệu fake
      isAnomaly     = true;
      anomalyReason = `lossRate ${(lossRate * 100).toFixed(2)}% thap bat thuong — nghi ngo bao cao sai`;
    }

    const confidence = isAnomaly
      ? Math.min(0.95, 0.6 + Math.abs(lossRate - baseline.max) * 5)
      : 1.0;

    const result: DustResult = {
      batchId, workerId, material,
      dust, lossRate, recoveryRate,
      isAnomaly, anomalyReason,
      confidence, timestamp,
    };

    // Feed vào hệ sống — Quantum Defense sẽ xử lý nếu cần
    EventBus.emit('cell.metric', {
      cell:       'dust-recovery-cell',
      metric:     'dust.loss_rate',
      value:      lossRate,
      confidence,
      source:     workerId,
      batchId,
    });

    if (isAnomaly) {
      typedEmit('DustShortfall', {
        workerId:  workerId ?? 'unknown',
        sach:      recoveredDust ?? 0,
        actual:    dust,
        source:    'dust-recovery-cell',
        ts:        Date.now(),
      });
      typedEmit('LowPhoDetected', {
        workerId:  workerId ?? 'unknown',
        luong:     'SX',
        pho:       lossRate,
        source:    'dust-recovery-cell',
        ts:        Date.now(),
      });
      EventBus.emit('cell.metric', {
        cell:       'dust-recovery-cell',
        metric:     'dust.anomaly',
        value:      1,
        confidence,
        reason:     anomalyReason,
        workerId,
        batchId,
      });
    }

    return result;
  }
}
