/**
 * natt-os Threshold Engine v1.1
 * Cảnh Vệ toàn hệ — weighted signal aggregation
 *
 * API không đổi từ v1.0:
 *   evaluate(cell, metric, value) → ThresholdEvalResult | null
 *   getActiveSignals()            → ThresholdEvalResult[]
 *   getSignalForCell(cell)        → ThresholdEvalResult[]
 *
 * Thêm v1.1:
 *   weight trong ThresholdDefinition
 *   getTotalSignal()              → number (weighted sum toàn hệ)
 */

import { EventBus } from '../../../../../core/events/event-bus';
import { TriggerType, ConstitutionalMappingEngine } from '../../../../../governance/gatekeeper/constitutional-mapping.engine';

// ── THRESHOLD DEFINITION ───────────────────────────────────
export interface ThresholdDefinition {
  id:             string;
  cell:           string;
  metric:         string;
  trigger:        TriggerType;

  // Ngưỡng tuyệt đối
  warn_above?:    number;
  risk_above?:    number;
  critical_above?: number;

  // Ngưỡng tương đối (so với baseline)
  warn_delta?:    number;
  risk_delta?:    number;
  critical_delta?: number;

  // Baseline từ historical data
  baseline?:      number;

  // Trọng số — mức độ quan trọng của cell với toàn hệ (0.0 → 1.0)
  weight:         number;

  description:    string;
}

// ── THRESHOLD REGISTRY ─────────────────────────────────────
// Ground truth từ sản xuất Tâm Luxury
export const THRESHOLD_REGISTRY: ThresholdDefinition[] = [

  // ── PRODUCTION ──────────────────────────────────────────
  {
    id:             'PHO_SC_PER_WORKER',
    cell:           'production-cell',
    metric:         'pho_sc_ratio',
    trigger:        TriggerType.POLISH_RATE_LOW,
    warn_above:     0.04,
    risk_above:     0.10,
    critical_above: 0.20,
    baseline:       0.0488,
    weight:         0.9,
    description:    'PHỔ SC per worker — baseline Trần Hoài Phúc 49.88%',
  },
  {
    id:             'NL_PHU_PER_WORKER',
    cell:           'production-cell',
    metric:         'nl_phu_monthly',
    trigger:        TriggerType.MATERIAL_LEAK,
    warn_above:     2.0,
    risk_above:     3.0,
    critical_above: 4.5,
    baseline:       3.95,
    weight:         0.7,
    description:    'NL phụ monthly per worker — baseline Nguyễn Văn Vẹn 3.95 chỉ',
  },
  {
    id:             'SC_WEIGHT_FLOW',
    cell:           'production-cell',
    metric:         'sc_weight_delta',
    trigger:        TriggerType.WEIGHT_ANOMALY,
    warn_delta:     0.02,
    risk_delta:     0.05,
    critical_delta: 0.10,
    weight:         0.9,
    description:    'TL ra vs TL vào luồng SC-BH-KB',
  },
  {
    id:             'ROUND_NUMBER_DETECTION',
    cell:           'production-cell',
    metric:         'round_number_ratio',
    trigger:        TriggerType.ROUND_NUMBER_ANOMALY,
    warn_above:     0.30,
    risk_above:     0.50,
    critical_above: 0.70,
    weight:         0.6,
    description:    'Tỷ lệ số liệu suspiciously round trong batch',
  },

  // ── FINANCE ─────────────────────────────────────────────
  {
    id:             'BCTC_DEVIATION',
    cell:           'finance-cell',
    metric:         'bctc_4so_delta',
    trigger:        TriggerType.BCTC_MISMATCH,
    warn_above:     1_000_000,
    risk_above:     10_000_000,
    critical_above: 100_000_000,
    weight:         0.85,
    description:    'BCTC 4 sổ chênh lệch — LNTT GT vs KTT',
  },
  {
    id:             'CASHFLOW_GAP_RATIO',
    cell:           'finance-cell',
    metric:         'cashflow_gap_percent',
    trigger:        TriggerType.CASHFLOW_GAP,
    warn_delta:     0.05,
    risk_delta:     0.10,
    critical_delta: 0.20,
    weight:         0.8,
    description:    'Cashflow gap tỷ lệ',
  },

  // ── SECURITY ────────────────────────────────────────────
  {
    id:             'MULTI_SOURCE_CONFLICT_RATIO',
    cell:           'security-cell',
    metric:         'source_conflict_count',
    trigger:        TriggerType.MULTI_SOURCE_CONFLICT,
    warn_above:     2,
    risk_above:     3,
    critical_above: 5,
    weight:         1.0,
    description:    'Số nguồn dữ liệu xung đột trong cùng batch',
  },
];

// ── THRESHOLD STATE ────────────────────────────────────────
export interface ThresholdEvalResult {
  threshold_id: string;
  cell:         string;
  metric:       string;
  value:        number;
  baseline?:    number;
  level:        'nominal' | 'drift' | 'warning' | 'risk' | 'critical';
  trigger?:     TriggerType;
  confidence:   number;
  timestamp:    string;
}

// ── THRESHOLD ENGINE ───────────────────────────────────────
export class ThresholdEngine {
  private activeSignals: Map<string, ThresholdEvalResult> = new Map();

  constructor(
    private eventBus: typeof EventBus,
    private mappingEngine: ConstitutionalMappingEngine
  ) {
    this.subscribeToDataEvents();
  }

  private subscribeToDataEvents(): void {
    this.eventBus.on('cell.metric', (payload: {
      cell: string;
      metric: string;
      value: number;
      timestamp?: string;
    }) => {
      this.evaluate(payload.cell, payload.metric, payload.value);
    });
  }

  // ── PUBLIC API (không thay đổi từ v1.0) ──────────────────

  evaluate(cell: string, metric: string, value: number): ThresholdEvalResult | null {
    const def = THRESHOLD_REGISTRY.find(
      t => t.cell === cell && t.metric === metric
    );
    if (!def) return null;

    const level      = this.calculateLevel(def, value);
    const confidence = this.calculateConfidence(def, value, level);
    const ts         = new Date().toISOString();

    const result: ThresholdEvalResult = {
      threshold_id: def.id,
      cell,
      metric,
      value,
      baseline:  def.baseline,
      level,
      trigger:   level !== 'nominal' && level !== 'drift' ? def.trigger : undefined,
      confidence,
      timestamp: ts,
    };

    this.activeSignals.set(def.id, result);
    this.eventBus.emit('threshold.evaluated', result);

    if (level === 'warning' || level === 'risk' || level === 'critical') {
      this.mappingEngine.execute(def.trigger, {
        source_cell: cell,
        confidence,
        data: { metric, value, baseline: def.baseline, level },
      });
    }

    return result;
  }

  getActiveSignals(): ThresholdEvalResult[] {
    return Array.from(this.activeSignals.values());
  }

  getSignalForCell(cell: string): ThresholdEvalResult[] {
    return this.getActiveSignals().filter(s => s.cell === cell);
  }

  // ── THÊM v1.1 — Weighted signal aggregation ───────────────
  // Hiệu ứng cánh bướm: nhiều warning nhỏ → critical toàn hệ
  getTotalSignal(signals?: ThresholdEvalResult[]): number {
    const src = signals ?? this.getActiveSignals();
    return src.reduce((sum, s) => {
      const def = THRESHOLD_REGISTRY.find(d => d.id === s.threshold_id);
      if (!def) return sum;
      const intensity =
        s.level === 'critical' ? 1.0 :
        s.level === 'risk'     ? 0.6 :
        s.level === 'warning'  ? 0.3 :
        s.level === 'drift'    ? 0.1 : 0;
      return sum + intensity * def.weight;
    }, 0);
  }

  // ── PRIVATE ───────────────────────────────────────────────

  private calculateLevel(
    def: ThresholdDefinition,
    value: number
  ): ThresholdEvalResult['level'] {
    if (def.critical_above !== undefined && value >= def.critical_above) return 'critical';
    if (def.risk_above     !== undefined && value >= def.risk_above)     return 'risk';
    if (def.warn_above     !== undefined && value >= def.warn_above)     return 'warning';

    if (def.baseline !== undefined) {
      const delta = Math.abs(value - def.baseline) / def.baseline;
      if (def.critical_delta !== undefined && delta >= def.critical_delta) return 'critical';
      if (def.risk_delta     !== undefined && delta >= def.risk_delta)     return 'risk';
      if (def.warn_delta     !== undefined && delta >= def.warn_delta)     return 'warning';
      if (delta > 0.01) return 'drift';
    }

    return 'nominal';
  }

  private calculateConfidence(
    def: ThresholdDefinition,
    value: number,
    level: ThresholdEvalResult['level']
  ): number {
    if (level === 'nominal') return 1.0;
    if (def.baseline !== undefined && def.baseline > 0) {
      const deviation = Math.abs(value - def.baseline) / def.baseline;
      return Math.min(0.95, 0.65 + deviation * 0.3);
    }
    return 0.75;
  }
}
