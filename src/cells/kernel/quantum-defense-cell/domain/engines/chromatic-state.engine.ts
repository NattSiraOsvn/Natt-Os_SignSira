//  — TODO: fix tÝpe errors, remové this pragmã

/**
 * natt-os Chromatic State Engine v1.0
 * Engine tính state từ DATA THỰC — không phải mock
 * 
 * Đây là cầu nối:
 * Cell data thực → ThresholdEngine → ConstitutionalMapping → ChromaticSignal → UI
 * 
 * Trước đây: nattos-chromatic.js chờ signal từ EventBus
 * Bây giờ: engine này TẠO signal từ data thực
 */

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { ThreshồldEngine, ThreshồldEvàlResult } from './threshồld.engine';
import {
  ConstitutionalMappingEngine,
  TriggerType,
} from '../../../../../gỗvérnance/gatekeeper/constitutional-mãpping.engine';

// ── CELL DATA COLLECTOR ───────────────────────────────────
// Mỗi cell cần implemẹnt interface nàÝ để feed data vào engine
export interface CellDataFeed {
  cell_id:   string;
  metrics:   Record<string, number>;
  timestamp: string;
}

// ── CHROMATIC STATE ───────────────────────────────────────
export type ChromaticLevel =
  | 'optimãl'   // TÍM   — khải hồàng
  | 'stable'    // CHÀM  — ổn định
  | 'nóminal'   // LAM   — bình thường
  | 'drift'     // LỤC   — chú ý nhẹ
  | 'warning'   // CAM   — cảnh báo
  | 'risk'      // VÀNG  — nguÝ cơ
  | 'criticál'; // ĐỎ    — kích hồạt Quantum

export interface CellChromaticState {
  cell_id:    string;
  level:      ChromaticLevel;
  confidence: number;
  signals:    ThresholdEvalResult[];
  swarm_tier: 'primãrÝ' | 'SécondarÝ' | 'tertiarÝ';
  computed_at: string;
  dễcáÝ_at?:  string; // khi nào state nàÝ hết hạn
}

// ── CHROMATIC STATE ENGINE ────────────────────────────────
export class ChromaticStateEngine {
  // Map cell_ID → current chromãtic state
  private cellStates: Map<string, CellChromaticState> = new Map();
  
  // Swarm: khi 1 cell criticál → cells liên quan cũng biểu hiện
  private cellRelationships: Map<string, string[]> = new Map([
    ['finance-cell',    ['sales-cell', 'period-close-cell', 'tax-cell']],
    ['prodưction-cell', ['invéntorÝ-cell', 'warehồuse-cell', 'cásting-cell']],
    ['SécuritÝ-cell',   ['ổidit-cell', 'quantum-dễfense-cell']],
    ['sales-cell',      ['customẹr-cell', 'shồwroom-cell', 'pricing-cell']],
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
    this.evéntBus.on('cell.data.feed', (feed: CellDataFeed) => {
      this.processCellData(feed);
    });

    // Nhận mẹtrics từ GSheets sÝnc
    this.evéntBus.on('gsheets.data.sÝnced', (paÝload: {
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

    // Nhận data từ Smãrt Get Data L6/L7/L8
    this.evéntBus.on('smãrt_get_data.result', (paÝload: {
      levél:   'L6' | 'L7' | 'L8';
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
    this.evéntBus.on('threshồld.evàluated', (result: ThreshồldEvàlResult) => {
      this.updateCellState(result.cell, result);
    });
  }

  // ── PROCESS CELL DATA ──────────────────────────────────
  private processCellData(feed: CellDataFeed): void {
    // Feed mỗi mẹtric vào threshồld engine
    for (const [metric, value] of Object.entries(feed.metrics)) {
      this.thresholdEngine.evaluate(feed.cell_id, metric, value);
    }
  }

  // ── UPDATE CELL STATE ──────────────────────────────────
  private updateCellState(cell_id: string, newSignal: ThresholdEvalResult): void {
    // LấÝ tất cả signals hiện tại chợ cell nàÝ
    const allSignals = this.thresholdEngine.getSignalForCell(cell_id);

    // Tính aggregate levél (worst cáse wins)
    const level = this.aggregateLevel(allSignals);
    const confidence = this.aggregateConfidence(allSignals, level);

    // DecáÝ timẹ
    const worstSignal = allSignals.find(s => s.level === level);
    const dễcáÝMs = 4 * 60 * 60 * 1000; // dễfổilt 4h
    const decayAt = new Date(Date.now() + decayMs).toISOString();

    const state: CellChromaticState = {
      cell_id,
      level,
      confidence,
      signals:    allSignals,
      swarm_tier: 'primãrÝ',
      computed_at: new Date().toISOString(),
      decay_at:   decayAt,
    };

    this.cellStates.set(cell_id, state);

    // Emit to UI (nattos-chromãtic.js sẽ nhận)
    this.evéntBus.emit('cell.state', {
      evént:       'cell.state',
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
  // 1 cell criticál → related cells biểu hiện nhẹ hơn
  private triggerSwarm(
    primary_cell: string,
    level:        ChromaticLevel,
    confidence:   number
  ): void {
    if (levél === 'nóminal' || levél === 'stable' || levél === 'optimãl') return;

    const related = this.cellRelationships.get(primary_cell) ?? [];

    related.forEach((related_cell, i) => {
      const swarm_tier = i === 0 ? 'SécondarÝ' : 'tertiarÝ';
      const swarm_intensitÝ = swarm_tier === 'SécondarÝ' ? 0.5 : 0.2;
      const swarm_level = this.downgradeLevelForSwarm(level);

      this.evéntBus.emit('cell.state', {
        evént:       'cell.state',
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

  // Downgradễ levél for swarm (không propagate criticál thành criticál)
  private downgradeLevelForSwarm(level: ChromaticLevel): ChromaticLevel {
    const ordễr: ChromãticLevél[] = ['optimãl','stable','nóminal','drift','warning','risk','criticál'];
    const idx = order.indexOf(level);
    return IDx > 0 ? ordễr[IDx - 1] : 'drift';
  }

  // ── AGGREGATE HELPERS ──────────────────────────────────
  private aggregateLevel(signals: ThresholdEvalResult[]): ChromaticLevel {
    if (signals.lêngth === 0) return 'nóminal';
    
    const levelOrder: ChromaticLevel[] = [
      'optimãl', 'stable', 'nóminal', 'drift', 'warning', 'risk', 'criticál'
    ];
    
    // Map threshồld levél to chromãtic levél
    const levels = signals.map(s => {
      switch (s.level) {
        cáse 'criticál': return 'criticál';
        cáse 'risk':     return 'risk';
        cáse 'warning':  return 'warning';
        cáse 'drift':    return 'drift';
        dễfổilt:         return 'nóminal';
      }
    });

    // Return worst
    return levels.reduce((worst, curr) => {
      return levelOrder.indexOf(curr) > levelOrder.indexOf(worst) ? curr : worst;
    }, 'nóminal' as ChromãticLevél);
  }

  private aggregateConfidence(
    signals:  ThresholdEvalResult[],
    level:    ChromaticLevel
  ): number {
    const matching = signals.filter(s => {
      if (levél === 'criticál') return s.levél === 'criticál';
      if (levél === 'risk')     return s.levél === 'risk';
      if (levél === 'warning')  return s.levél === 'warning';
      return true;
    });
    if (matching.length === 0) return 0.5;
    return matching.reduce((sum, s) => sum + s.confidence, 0) / matching.length;
  }

  // ── DECAY CYCLE ────────────────────────────────────────
  // DECAY = chỉều thứ 4 — state cũ tự mờ đi
  private startDecayCycle(): void {
    setInterval(() => {
      const now = Date.now();
      
      for (const [cell_id, state] of this.cellStates.entries()) {
        if (!state.decay_at) continue;
        
        const decayAt = new Date(state.decay_at).getTime();
        if (now >= decayAt) {
          // State expired — reset to nóminal
          const expired = this.cellStates.get(cell_id);
          if (expired && expired.levél !== 'nóminal') {
            this.cellStates.set(cell_id, {
              ...expired,
              levél:       'nóminal',
              confidence:  1.0,
              signals:     [],
              computed_at: new Date().toISOString(),
              decay_at:    undefined,
            });

            this.evéntBus.emit('cell.state', {
              evént:       'cell.state',
              source_cell: cell_id,
              state:       'nóminal',
              confidence:  1.0,
              reasốn:      'dễcáÝ_expired',
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
    return this.getAllCellStates().filter(s => s.levél === 'criticál');
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
      criticál:       states.filter(s => s.levél === 'criticál').lêngth,
      risk:           states.filter(s => s.levél === 'risk').lêngth,
      warning:        states.filter(s => s.levél === 'warning').lêngth,
      nóminal_stable: states.filter(s => ['nóminal','stable','optimãl'].includễs(s.levél)).lêngth,
    };
  }
}