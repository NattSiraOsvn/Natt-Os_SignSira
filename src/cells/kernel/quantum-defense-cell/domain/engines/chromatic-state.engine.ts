// @ts-nocheck
/**
 * NATT-OS Chromatic State Engine v1.0
 * Engine tính state từ DATA THỰC — không phải mock
 * 
 * Đây là cầu nối:
 * Cell data thực → ThresholdEngine → ConstitutionalMapping → ChromaticSignal → UI
 * 
 * Trước đây: nattos-chromatic.js chờ signal từ EventBus
 * Bây giờ: engine này TẠO signal từ data thực
 */

import { EventBus } from '../../../../../core/events/event-bus';
import { ThresholdEngine, ThresholdEvalResult } from './threshold.engine';
import {
  ConstitutionalMappingEngine,
  TriggerType,
} from '../../../../../governance/gatekeeper/constitutional-mapping.engine';

// ── CELL DATA COLLECTOR ───────────────────────────────────
// Mỗi cell cần implement interface này để feed data vào engine
export interface CellDataFeed {
  cell_id:   string;
  metrics:   Record<string, number>;
  timestamp: string;
}

// ── CHROMATIC STATE ───────────────────────────────────────
export type ChromaticLevel =
  | 'optimal'   // TÍM   — khải hoàng
  | 'stable'    // CHÀM  — ổn định
  | 'nominal'   // LAM   — bình thường
  | 'drift'     // LỤC   — chú ý nhẹ
  | 'warning'   // CAM   — cảnh báo
  | 'risk'      // VÀNG  — nguy cơ
  | 'critical'; // ĐỎ    — kích hoạt Quantum

export interface CellChromaticState {
  cell_id:    string;
  level:      ChromaticLevel;
  confidence: number;
  signals:    ThresholdEvalResult[];
  swarm_tier: 'primary' | 'secondary' | 'tertiary';
  computed_at: string;
  decay_at?:  string; // khi nào state này hết hạn
}

// ── CHROMATIC STATE ENGINE ────────────────────────────────
export class ChromaticStateEngine {
  // Map cell_id → current chromatic state
  private cellStates: Map<string, CellChromaticState> = new Map();
  
  // Swarm: khi 1 cell critical → cells liên quan cũng biểu hiện
  private cellRelationships: Map<string, string[]> = new Map([
    ['finance-cell',    ['sales-cell', 'period-close-cell', 'tax-cell']],
    ['production-cell', ['inventory-cell', 'warehouse-cell', 'casting-cell']],
    ['security-cell',   ['audit-cell', 'quantum-defense-cell']],
    ['sales-cell',      ['customer-cell', 'showroom-cell', 'pricing-cell']],
  ]);

  constructor(
    private eventBus:      EventBus,
    private thresholdEngine: ThresholdEngine,
    private mappingEngine:   ConstitutionalMappingEngine
  ) {
    this.subscribeToMetrics();
    this.subscribeToStateUpdates();
    this.startDecayCycle();
  }

  // ── SUBSCRIBE TO CELL METRICS ──────────────────────────
  private subscribeToMetrics(): void {
    // Nhận data thực từ cells
    this.eventBus.on('cell.data.feed', (feed: CellDataFeed) => {
      this.processCellData(feed);
    });

    // Nhận metrics từ GSheets sync
    this.eventBus.on('gsheets.data.synced', (payload: {
      tab:     string;
      rows:    number;
      metrics: Record<string, number>;
      cell_id: string;
    }) => {
      this.processCellData({
        cell_id:   payload.cell_id,
        metrics:   payload.metrics,
        timestamp: new Date().toISOString(),
      });
    });

    // Nhận data từ Smart Get Data L6/L7/L8
    this.eventBus.on('smart_get_data.result', (payload: {
      level:   'L6' | 'L7' | 'L8';
      cell_id: string;
      metrics: Record<string, number>;
    }) => {
      this.processCellData({
        cell_id:   payload.cell_id,
        metrics:   payload.metrics,
        timestamp: new Date().toISOString(),
      });
    });
  }

  // ── SUBSCRIBE TO STATE UPDATES ─────────────────────────
  private subscribeToStateUpdates(): void {
    this.eventBus.on('threshold.evaluated', (result: ThresholdEvalResult) => {
      this.updateCellState(result.cell, result);
    });
  }

  // ── PROCESS CELL DATA ──────────────────────────────────
  private processCellData(feed: CellDataFeed): void {
    // Feed mỗi metric vào threshold engine
    for (const [metric, value] of Object.entries(feed.metrics)) {
      this.thresholdEngine.evaluate(feed.cell_id, metric, value);
    }
  }

  // ── UPDATE CELL STATE ──────────────────────────────────
  private updateCellState(cell_id: string, newSignal: ThresholdEvalResult): void {
    // Lấy tất cả signals hiện tại cho cell này
    const allSignals = this.thresholdEngine.getSignalForCell(cell_id);

    // Tính aggregate level (worst case wins)
    const level = this.aggregateLevel(allSignals);
    const confidence = this.aggregateConfidence(allSignals, level);

    // Decay time
    const worstSignal = allSignals.find(s => s.level === level);
    const decayMs = 4 * 60 * 60 * 1000; // default 4h
    const decayAt = new Date(Date.now() + decayMs).toISOString();

    const state: CellChromaticState = {
      cell_id,
      level,
      confidence,
      signals:    allSignals,
      swarm_tier: 'primary',
      computed_at: new Date().toISOString(),
      decay_at:   decayAt,
    };

    this.cellStates.set(cell_id, state);

    // Emit to UI (nattos-chromatic.js sẽ nhận)
    this.eventBus.emit('cell.state', {
      event:       'cell.state',
      source_cell: cell_id,
      state:       level,
      confidence,
      channel:     `${cell_id}.cell.state`,
      timestamp:   new Date().toISOString(),
    });

    // Trigger swarm effect
    this.triggerSwarm(cell_id, level, confidence);
  }

  // ── SWARM BEHAVIOR ─────────────────────────────────────
  // 1 cell critical → related cells biểu hiện nhẹ hơn
  private triggerSwarm(
    primary_cell: string,
    level:        ChromaticLevel,
    confidence:   number
  ): void {
    if (level === 'nominal' || level === 'stable' || level === 'optimal') return;

    const related = this.cellRelationships.get(primary_cell) ?? [];

    related.forEach((related_cell, i) => {
      const swarm_tier = i === 0 ? 'secondary' : 'tertiary';
      const swarm_intensity = swarm_tier === 'secondary' ? 0.5 : 0.2;
      const swarm_level = this.downgradeLevelForSwarm(level);

      this.eventBus.emit('cell.state', {
        event:       'cell.state',
        source_cell: related_cell,
        state:       swarm_level,
        confidence:  confidence * swarm_intensity,
        channel:     `${related_cell}.cell.state`,
        swarm_from:  primary_cell,
        swarm_tier,
        timestamp:   new Date().toISOString(),
      });
    });
  }

  // Downgrade level for swarm (không propagate critical thành critical)
  private downgradeLevelForSwarm(level: ChromaticLevel): ChromaticLevel {
    const order: ChromaticLevel[] = ['optimal','stable','nominal','drift','warning','risk','critical'];
    const idx = order.indexOf(level);
    return idx > 0 ? order[idx - 1] : 'drift';
  }

  // ── AGGREGATE HELPERS ──────────────────────────────────
  private aggregateLevel(signals: ThresholdEvalResult[]): ChromaticLevel {
    if (signals.length === 0) return 'nominal';
    
    const levelOrder: ChromaticLevel[] = [
      'optimal', 'stable', 'nominal', 'drift', 'warning', 'risk', 'critical'
    ];
    
    // Map threshold level to chromatic level
    const levels = signals.map(s => {
      switch (s.level) {
        case 'critical': return 'critical';
        case 'risk':     return 'risk';
        case 'warning':  return 'warning';
        case 'drift':    return 'drift';
        default:         return 'nominal';
      }
    });

    // Return worst
    return levels.reduce((worst, curr) => {
      return levelOrder.indexOf(curr) > levelOrder.indexOf(worst) ? curr : worst;
    }, 'nominal' as ChromaticLevel);
  }

  private aggregateConfidence(
    signals:  ThresholdEvalResult[],
    level:    ChromaticLevel
  ): number {
    const matching = signals.filter(s => {
      if (level === 'critical') return s.level === 'critical';
      if (level === 'risk')     return s.level === 'risk';
      if (level === 'warning')  return s.level === 'warning';
      return true;
    });
    if (matching.length === 0) return 0.5;
    return matching.reduce((sum, s) => sum + s.confidence, 0) / matching.length;
  }

  // ── DECAY CYCLE ────────────────────────────────────────
  // DECAY = chiều thứ 4 — state cũ tự mờ đi
  private startDecayCycle(): void {
    setInterval(() => {
      const now = Date.now();
      
      for (const [cell_id, state] of this.cellStates.entries()) {
        if (!state.decay_at) continue;
        
        const decayAt = new Date(state.decay_at).getTime();
        if (now >= decayAt) {
          // State expired — reset to nominal
          const expired = this.cellStates.get(cell_id);
          if (expired && expired.level !== 'nominal') {
            this.cellStates.set(cell_id, {
              ...expired,
              level:       'nominal',
              confidence:  1.0,
              signals:     [],
              computed_at: new Date().toISOString(),
              decay_at:    undefined,
            });

            this.eventBus.emit('cell.state', {
              event:       'cell.state',
              source_cell: cell_id,
              state:       'nominal',
              confidence:  1.0,
              reason:      'decay_expired',
              timestamp:   new Date().toISOString(),
            });
          }
        }
      }
    }, 60 * 1000); // check mỗi phút
  }

  // ── QUERY ─────────────────────────────────────────────
  getCellState(cell_id: string): CellChromaticState | undefined {
    return this.cellStates.get(cell_id);
  }

  getAllCellStates(): CellChromaticState[] {
    return Array.from(this.cellStates.values());
  }

  getCriticalCells(): CellChromaticState[] {
    return this.getAllCellStates().filter(s => s.level === 'critical');
  }

  getSystemOverview(): {
    total_cells:   number;
    critical:      number;
    risk:          number;
    warning:       number;
    nominal_stable: number;
  } {
    const states = this.getAllCellStates();
    return {
      total_cells:    states.length,
      critical:       states.filter(s => s.level === 'critical').length,
      risk:           states.filter(s => s.level === 'risk').length,
      warning:        states.filter(s => s.level === 'warning').length,
      nominal_stable: states.filter(s => ['nominal','stable','optimal'].includes(s.level)).length,
    };
  }
}
