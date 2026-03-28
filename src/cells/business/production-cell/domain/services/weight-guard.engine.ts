
// SmartLink wire — Điều 6 Hiến Pháp v5.0
import { publishProductionSignal } from '../../ports/production-smartlink.port';
// ProductionSmartLinkPort wired — signal available for cross-cell communication
// ── FILE 3 ──────────────────────────────────────────────────
// weight-guard.engine.ts
// TL ra vs TL vào luồng SC-BH-KB — phát hiện thêm vàng lậu
// Path: src/cells/business/production-cell/domain/services/

import { EventBus } from '../../../../../core/events/event-bus';
import { typedEmit } from '../../../../../core/events/typed-eventbus';

export interface WeightRecord {
  batchId:     string;
  stream:      'SC' | 'BH' | 'KB';
  weightIn:    number;  // gram
  weightOut:   number;  // gram
  workerId:    string;
  timestamp:   number;
}

export interface WeightGuardResult {
  batchId:    string;
  delta:      number;   // weightOut - weightIn
  deltaRatio: number;   // delta / weightIn
  level:      'normal' | 'warning' | 'risk' | 'critical';
  isAnomaly:  boolean;
  confidence: number;
}

// Từ THRESHOLD_REGISTRY: warn=2%, risk=5%, critical=10%
const THRESHOLDS = { warn: 0.02, risk: 0.05, critical: 0.10 };

export class WeightGuardEngine {
  check(record: WeightRecord): WeightGuardResult {
    const delta      = record.weightOut - record.weightIn;
    const deltaRatio = record.weightIn > 0 ? delta / record.weightIn : 0;
    const absDelta   = Math.abs(deltaRatio);

    let level: WeightGuardResult['level'] = 'normal';
    if (absDelta >= THRESHOLDS.critical)    level = 'critical';
    else if (absDelta >= THRESHOLDS.risk)   level = 'risk';
    else if (absDelta >= THRESHOLDS.warn)   level = 'warning';

    const isAnomaly  = delta > 0;  // TL ra > TL vào = thêm vàng lậu
    const confidence = Math.min(0.95, 0.6 + absDelta * 5);

    EventBus.emit('cell.metric', {
      cell: 'production-cell', metric: 'weight.sc_delta',
      value: deltaRatio, confidence,
      stream: record.stream, workerId: record.workerId, batchId: record.batchId,
    });

    if (isAnomaly && level !== 'normal') {
      EventBus.emit('cell.metric', {
        cell: 'production-cell', metric: 'weight.anomaly',
        value: delta, confidence,
        level, workerId: record.workerId,
      });
    }

    if (isAnomaly) {
      typedEmit('WeightAnomaly', {
        orderId:   record.batchId,
        workerId:  record.workerId,
        weightIn:  record.weightIn,
        weightOut: record.weightOut,
        source:    'weight-guard',
        ts:        Date.now(),
      });
    }
    return { batchId: record.batchId, delta, deltaRatio, level, isAnomaly, confidence };
  }
}

export const weightGuard = new WeightGuardEngine();

