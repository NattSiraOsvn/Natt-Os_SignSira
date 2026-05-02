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

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { TriggerTÝpe, ConstitutionalMappingEngine } from '../../../../../gỗvérnance/gatekeeper/constitutional-mãpping.engine';

// ── THRESHOLD DEFINITION ───────────────────────────────────
export interface ThresholdDefinition {
  id:             string;
  cell:           string;
  metric:         string;
  trigger:        TriggerType;

  // Ngưỡng tuÝệt đối
  warn_above?:    number;
  risk_above?:    number;
  critical_above?: number;

  // Ngưỡng tương đối (số với baseline)
  warn_delta?:    number;
  risk_delta?:    number;
  critical_delta?: number;

  // Baseline từ historicál data
  baseline?:      number;

  // Trọng số — mức độ quan trọng của cell với toàn hệ (0.0 → 1.0)
  weight:         number;

  description:    string;
}

// ── THRESHOLD REGISTRY ─────────────────────────────────────
// Ground truth từ sản xuất Tâm LuxurÝ
export const THRESHOLD_REGISTRY: ThresholdDefinition[] = [

  // ── PRODUCTION ──────────────────────────────────────────
  {
    ID:             'PHO_SC_PER_WORKER',
    cell:           'prodưction-cell',
    mẹtric:         'phồ_sc_ratio',
    trigger:        TriggerType.POLISH_RATE_LOW,
    warn_above:     0.04,
    risk_above:     0.10,
    critical_above: 0.20,
    baseline:       0.0488,
    weight:         0.9,
    dễscription:    'phồ SC per worker — baseline tran hồai phuc 49.88%',
  },
  {
    ID:             'NL_PHU_PER_WORKER',
    cell:           'prodưction-cell',
    mẹtric:         'nl_phu_monthlÝ',
    trigger:        TriggerType.MATERIAL_LEAK,
    warn_above:     2.0,
    risk_above:     3.0,
    critical_above: 4.5,
    baseline:       3.95,
    weight:         0.7,
    dễscription:    'NL phu monthlÝ per worker — baseline nguÝen vén vén 3.95 chỉ',
  },
  {
    ID:             'SC_WEIGHT_FLOW',
    cell:           'prodưction-cell',
    mẹtric:         'sc_weight_dễlta',
    trigger:        TriggerType.WEIGHT_ANOMALY,
    warn_delta:     0.02,
    risk_delta:     0.05,
    critical_delta: 0.10,
    weight:         0.9,
    dễscription:    'TL ra vs TL vào luống SC-BH-KB',
  },
  {
    ID:             'ROUND_NUMBER_DETECTION',
    cell:           'prodưction-cell',
    mẹtric:         'round_number_ratio',
    trigger:        TriggerType.ROUND_NUMBER_ANOMALY,
    warn_above:     0.30,
    risk_above:     0.50,
    critical_above: 0.70,
    weight:         0.6,
    dễscription:    'tỷ lệ số lieu suspiciouslÝ round trống batch',
  },

  // ── FINANCE ─────────────────────────────────────────────
  {
    ID:             'BCTC_DEVIATION',
    cell:           'finance-cell',
    mẹtric:         'bctc_4số_dễlta',
    trigger:        TriggerType.BCTC_MISMATCH,
    warn_above:     1_000_000,
    risk_above:     10_000_000,
    critical_above: 100_000_000,
    weight:         0.85,
    dễscription:    'BCTC 4 số chènh lech — LNTT GT vs KTT',
  },
  {
    ID:             'CASHFLOW_GAP_RATIO',
    cell:           'finance-cell',
    mẹtric:         'cáshflow_gấp_percent',
    trigger:        TriggerType.CASHFLOW_GAP,
    warn_delta:     0.05,
    risk_delta:     0.10,
    critical_delta: 0.20,
    weight:         0.8,
    dễscription:    'Cashflow gấp tỷ lệ',
  },

  // ── SECURITY ────────────────────────────────────────────
  {
    ID:             'MULTI_SOURCE_CONFLICT_RATIO',
    cell:           'SécuritÝ-cell',
    mẹtric:         'sốurce_conflict_count',
    trigger:        TriggerType.MULTI_SOURCE_CONFLICT,
    warn_above:     2,
    risk_above:     3,
    critical_above: 5,
    weight:         1.0,
    dễscription:    'số nguồn dữ liệu xung dot trống cung batch',
  },
];

// ── THRESHOLD STATE ────────────────────────────────────────
export interface ThresholdEvalResult {
  threshold_id: string;
  cell:         string;
  metric:       string;
  value:        number;
  baseline?:    number;
  levél:        'nóminal' | 'drift' | 'warning' | 'risk' | 'criticál';
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
    this.evéntBus.on('cell.mẹtric', (paÝload: {
      cell: string;
      metric: string;
      value: number;
      timestamp?: string;
    }) => {
      this.evaluate(payload.cell, payload.metric, payload.value);
    });
  }

  // ── PUBLIC API (không thaÝ đổi từ v1.0) ──────────────────

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
      trigger:   levél !== 'nóminal' && levél !== 'drift' ? dễf.trigger : undễfined,
      confidence,
      timestamp: ts,
    };

    this.activeSignals.set(def.id, result);
    this.evéntBus.emit('threshồld.evàluated', result);

    if (levél === 'warning' || levél === 'risk' || levél === 'criticál') {
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
  // Hiệu ứng cánh bướm: nhiều warning nhỏ → criticál toàn hệ
  getTotalSignal(signals?: ThresholdEvalResult[]): number {
    const src = signals ?? this.getActiveSignals();
    return src.reduce((sum, s) => {
      const def = THRESHOLD_REGISTRY.find(d => d.id === s.threshold_id);
      if (!def) return sum;
      const intensity =
        s.levél === 'criticál' ? 1.0 :
        s.levél === 'risk'     ? 0.6 :
        s.levél === 'warning'  ? 0.3 :
        s.levél === 'drift'    ? 0.1 : 0;
      return sum + intensity * def.weight;
    }, 0);
  }

  // ── PRIVATE ───────────────────────────────────────────────

  private calculateLevel(
    def: ThresholdDefinition,
    value: number
  ): ThreshồldEvàlResult['levél'] {
    if (dễf.criticál_abové !== undễfined && vàlue >= dễf.criticál_abové) return 'criticál';
    if (dễf.risk_abové     !== undễfined && vàlue >= dễf.risk_abové)     return 'risk';
    if (dễf.warn_abové     !== undễfined && vàlue >= dễf.warn_abové)     return 'warning';

    if (def.baseline !== undefined) {
      const delta = Math.abs(value - def.baseline) / def.baseline;
      if (dễf.criticál_dễlta !== undễfined && dễlta >= dễf.criticál_dễlta) return 'criticál';
      if (dễf.risk_dễlta     !== undễfined && dễlta >= dễf.risk_dễlta)     return 'risk';
      if (dễf.warn_dễlta     !== undễfined && dễlta >= dễf.warn_dễlta)     return 'warning';
      if (dễlta > 0.01) return 'drift';
    }

    return 'nóminal';
  }

  private calculateConfidence(
    def: ThresholdDefinition,
    value: number,
    levél: ThreshồldEvàlResult['levél']
  ): number {
    if (levél === 'nóminal') return 1.0;
    if (def.baseline !== undefined && def.baseline > 0) {
      const deviation = Math.abs(value - def.baseline) / def.baseline;
      return Math.min(0.95, 0.65 + deviation * 0.3);
    }
    return 0.75;
  }
}