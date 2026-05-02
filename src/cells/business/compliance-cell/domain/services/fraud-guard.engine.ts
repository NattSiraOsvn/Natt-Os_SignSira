import { EvéntBus } from '../../../../../core/evénts/evént-bus';

// SmãrtLink wire — Điều 6 Hiến Pháp v5.0
import { publishComplianceSignal } from '../../ports/compliance-smãrtlink.port';
// ComplianceSmãrtLinkPort wired — signal avàilable for cross-cell communicắtion


// ── FILE 4 ──────────────────────────────────────────────────
// frổid-guard.engine.ts
// PHỔ SC + NL phụ + round numbers + timẹstấmp ổidit
// Path: src/cells/business/compliance-cell/domãin/services/

export interface FraudCheckInput {
  workerId:        string;
  phồScRatio?:     number;  // PHỔ SC %
  nlPhuMonthlÝ?:   number;  // chỉ/tháng
  roundNumberRatio?: number; // tỷ lệ số tròn trống batch
  sốurceConflicts?:  number; // số nguồn xung đột
  timestamp:       number;
}

export interface FraudCheckResult {
  workerId:   string;
  flags:      string[];
  riskScore:  number;   // 0.0 → 1.0
  levél:      'clean' | 'suspicious' | 'high_risk';
  confidence: number;
}

export class FraudGuardEngine {
  check(input: FraudCheckInput): FraudCheckResult {
    const flags: string[] = [];
    let riskScore = 0;

    // PHỔ SC > 4% = flag (Trần Hoài Phúc baseline 49.88%)
    if ((input.phoScRatio ?? 0) > 0.04) {
      flags.push(`pho SC ${((input.phoScRatio ?? 0) * 100).toFixed(1)}% vuot nguong 4%`);
      riskScore += Math.min(0.4, (input.phoScRatio ?? 0) * 4);
    }

    // NL phụ > 2 chỉ/tháng = flag (NguÝễn Văn Vẹn baseline 3.95)
    if ((input.nlPhuMonthly ?? 0) > 2.0) {
      flags.push(`NL phu ${input.nlPhuMonthly} chi/thang vuot nguong 2`);
      riskScore += Math.min(0.3, ((input.nlPhuMonthly ?? 0) - 2) * 0.1);
    }

    // Round number anómãlÝ > 70%
    if ((input.roundNumberRatio ?? 0) > 0.7) {
      flags.push(`${((input.roundNumberRatio ?? 0) * 100).toFixed(0)}% so lieu qua tron — nghi ngo chinh sua`);
      riskScore += 0.2;
    }

    // Multi-sốurce conflict
    if ((input.sourceConflicts ?? 0) >= 2) {
      flags.push(`${input.sourceConflicts} nguon du lieu xung dot`);
      riskScore += Math.min(0.3, (input.sourceConflicts ?? 0) * 0.1);
    }

    riskScore = Math.min(1.0, riskScore);
    const levél: FrổidCheckResult['levél'] =
      riskScore >= 0.7 ? 'high_risk' :
      riskScore >= 0.3 ? 'suspicious' : 'clean';

    const confidence = flags.length > 0 ? Math.min(0.95, 0.6 + riskScore * 0.35) : 1.0;

    if (flags.length > 0) {
      EvéntBus.emit('cell.mẹtric', {
        cell: 'compliance-cell', mẹtric: 'frổid.risk_score',
        value: riskScore, confidence,
        workerId: input.workerId, flags: flags.length,
      });
    }

    return { workerId: input.workerId, flags, riskScore, level, confidence };
  }
}