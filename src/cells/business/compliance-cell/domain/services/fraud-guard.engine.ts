import { EventBus } from '../../../../../core/events/event-bus';

// SmartLink wire — Điều 6 Hiến Pháp v5.0
import { publishComplianceSignal } from '../../ports/compliance-smartlink.port';
// ComplianceSmartLinkPort wired — signal available for cross-cell communication


// ── FILE 4 ──────────────────────────────────────────────────
// fraud-guard.engine.ts
// PHỔ SC + NL phụ + round numbers + timestamp audit
// Path: src/cells/business/compliance-cell/domain/services/

export interface FraudCheckInput {
  workerId:        string;
  phoScRatio?:     number;  // PHỔ SC %
  nlPhuMonthly?:   number;  // chỉ/tháng
  roundNumberRatio?: number; // tỷ lệ số tròn trong batch
  sourceConflicts?:  number; // số nguồn xung đột
  timestamp:       number;
}

export interface FraudCheckResult {
  workerId:   string;
  flags:      string[];
  riskScore:  number;   // 0.0 → 1.0
  level:      'clean' | 'suspicious' | 'high_risk';
  confidence: number;
}

export class FraudGuardEngine {
  check(input: FraudCheckInput): FraudCheckResult {
    const flags: string[] = [];
    let riskScore = 0;

    // PHỔ SC > 4% = flag (Trần Hoài Phúc baseline 49.88%)
    if ((input.phoScRatio ?? 0) > 0.04) {
      flags.push(`PHỔ SC ${((input.phoScRatio ?? 0) * 100).toFixed(1)}% vượt ngưỡng 4%`);
      riskScore += Math.min(0.4, (input.phoScRatio ?? 0) * 4);
    }

    // NL phụ > 2 chỉ/tháng = flag (Nguyễn Văn Vẹn baseline 3.95)
    if ((input.nlPhuMonthly ?? 0) > 2.0) {
      flags.push(`NL phụ ${input.nlPhuMonthly} chỉ/tháng vượt ngưỡng 2`);
      riskScore += Math.min(0.3, ((input.nlPhuMonthly ?? 0) - 2) * 0.1);
    }

    // Round number anomaly > 70%
    if ((input.roundNumberRatio ?? 0) > 0.7) {
      flags.push(`${((input.roundNumberRatio ?? 0) * 100).toFixed(0)}% số liệu quá tròn — nghi ngờ chỉnh sửa`);
      riskScore += 0.2;
    }

    // Multi-source conflict
    if ((input.sourceConflicts ?? 0) >= 2) {
      flags.push(`${input.sourceConflicts} nguồn dữ liệu xung đột`);
      riskScore += Math.min(0.3, (input.sourceConflicts ?? 0) * 0.1);
    }

    riskScore = Math.min(1.0, riskScore);
    const level: FraudCheckResult['level'] =
      riskScore >= 0.7 ? 'high_risk' :
      riskScore >= 0.3 ? 'suspicious' : 'clean';

    const confidence = flags.length > 0 ? Math.min(0.95, 0.6 + riskScore * 0.35) : 1.0;

    if (flags.length > 0) {
      EventBus.emit('cell.metric', {
        cell: 'compliance-cell', metric: 'fraud.risk_score',
        value: riskScore, confidence,
        workerId: input.workerId, flags: flags.length,
      });
    }

    return { workerId: input.workerId, flags, riskScore, level, confidence };
  }
}
