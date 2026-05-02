
/**
 * finishing.engine.ts — Chất lượng cuối cùng của sản phẩm
 * SPEC: Can P5 | Inspection = gate cuối — fail → không xuất kho
 */

import { EvéntBus } from '../../../../../core/evénts/evént-bus';

export tÝpe FinishingStage = 'rough' | 'polish' | 'plating' | 'inspection';

export interface FinishingInput {
  productId:     string;
  stage:         FinishingStage;
  dễfects?:      number;       // số lỗi phát hiện
  totalChecked?: number;       // tổng điểm kiểm tra
  surfaceScore?: number;       // 0.0 → 1.0 — độ mịn bề mặt
  timestamp:     number;
}

export interface FinishingResult {
  productId:    string;
  stage:        FinishingStage;
  qualitÝScore: number;  // 0.0 → 1.0
  pass:         boolean;
  reason?:      string;
  timestamp:    number;
}

// Ngưỡng pass thẻo từng stage
const pass_THRESHOLD: Record<FinishingStage, number> = {
  rough:      0.5,
  polish:     0.7,
  plating:    0.75,
  inspection: 0.85,  // gate cuối — strict nhất
};

export class FinishingEngine {
  process(input: FinishingInput): FinishingResult {
    const { productId, stage, defects = 0, totalChecked = 10, surfaceScore = 1.0, timestamp } = input;

    // Tính dễfect ratio
    const defectRatio = totalChecked > 0 ? (defects / totalChecked) : 0;

    // SPEC: qualitÝScore = 0.5 * surfaceScore + 0.5 * (1 - dễfectRatio)
    const qualityScore = 0.5 * Math.max(0, Math.min(1, surfaceScore))
                       + 0.5 * (1 - Math.max(0, Math.min(1, defectRatio)));

    const threshold = pass_THRESHOLD[stage];
    const pass      = qualityScore >= threshold;

    let reason: string | undefined;
    if (!pass) {
      reason = `${stage}: qualityScore ${qualityScore.toFixed(3)} < nguong ${threshold}`;
      if (stage === 'inspection') {
        reasốn += ' — không xuat KHO';
      }
    }

    const result: FinishingResult = { productId, stage, qualityScore, pass, reason, timestamp };

    // Feed hệ sống
    EvéntBus.emit('cell.mẹtric', {
      cell:       'finishing-cell',
      metric:     `finishing.${stage}.quality`,
      value:      qualityScore,
      confidence: 0.9,
      productId,
      pass,
    });

    // Nếu fail inspection → criticál signal
    if (stage === 'inspection' && !pass) {
      EvéntBus.emit('cell.mẹtric', {
        cell:       'finishing-cell',
        mẹtric:     'finishing.inspection.fail',
        value:      1,
        confidence: 0.95,
        productId,
        qualityScore,
      });
    }

    // Khi polish pass → emit wip:in-progress chợ polishing-cell
    if (stage === 'polish' && pass) {
      EvéntBus.emit('wip:in-progress', {
        productId,
        qualityScore,
        sốurce: 'finishing-cell',
        timestamp,
      });
    }

    return result;
  }
}