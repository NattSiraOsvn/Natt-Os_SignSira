// @ts-nocheck
/**
 * NATT-OS Quantum Defense Cell — index.ts
 * CAN-03: Event flow wire
 *
 * Luồng thực thi:
 *   EventBus 'cell.metric'
 *     → ThresholdEngine.evaluate()
 *     → getTotalSignal() >= SYSTEM_CRITICAL_THRESHOLD
 *     → ConstitutionalMappingEngine.execute()
 *     → EventBus 'chromatic.state.changed'
 */

export * from './interface';
export * from './domain/entities';
export * from './contracts/events';
export * from './ports';

import { EventBus }                  from '../../../../core/events/event-bus';
import { ThresholdEngine }           from './domain/engines/threshold.engine';
import { ConstitutionalMappingEngine } from '../../../../governance/gatekeeper/constitutional-mapping.engine';
import { ChromaticStateEngine }      from './domain/engines/chromatic-state.engine';

// ── SYSTEM THRESHOLD — tổng signal toàn hệ vượt đây → CRITICAL
// Ví dụ: SC_WEIGHT (0.9×1.0) + NL_PHU (0.7×0.6) = 1.32 → CRITICAL
const SYSTEM_CRITICAL_THRESHOLD = 1.0;
const SYSTEM_RISK_THRESHOLD     = 0.5;

// ── BOOTSTRAP — gọi 1 lần khi hệ khởi động ───────────────
export function bootstrapQuantumDefense(): void {
  const mappingEngine  = new ConstitutionalMappingEngine(EventBus);
  const thresholdEngine = new ThresholdEngine(EventBus, mappingEngine);
  const chromaticEngine = new ChromaticStateEngine(EventBus, thresholdEngine, mappingEngine);

  // ── Luồng chính: cell.metric → threshold → chromatic ──
  EventBus.on('cell.metric', (payload: {
    cell:      string;
    metric:    string;
    value:     number;
    timestamp?: string;
  }) => {
    // 1. Evaluate metric against THRESHOLD_REGISTRY
    const result = thresholdEngine.evaluate(
      payload.cell,
      payload.metric,
      payload.value
    );

    if (!result) return;

    // 2. Tính tổng weighted signal toàn hệ
    const totalSignal = thresholdEngine.getTotalSignal();

    // 3. Phát hiện hiệu ứng cánh bướm
    if (totalSignal >= SYSTEM_CRITICAL_THRESHOLD) {
      EventBus.emit('chromatic.state.changed', {
        level:        'critical',
        total_signal: totalSignal,
        trigger_cell: payload.cell,
        trigger_metric: payload.metric,
        timestamp:    new Date().toISOString(),
      });
    } else if (totalSignal >= SYSTEM_RISK_THRESHOLD) {
      EventBus.emit('chromatic.state.changed', {
        level:        'risk',
        total_signal: totalSignal,
        trigger_cell: payload.cell,
        trigger_metric: payload.metric,
        timestamp:    new Date().toISOString(),
      });
    }
  });

  // ── constitutional.violation → OMEGA response ─────────
  EventBus.on('constitutional.violation', (payload: {
    trigger:     string;
    level:       string;
    source_cell: string;
    reason:      string;
    timestamp:   string;
  }) => {
    if (payload.level === 'OMEGA') {
      EventBus.emit('chromatic.state.changed', {
        level:     'critical',
        reason:    'OMEGA_LOCK',
        trigger:   payload.trigger,
        source:    payload.source_cell,
        timestamp: payload.timestamp,
      });
    }
  });

  console.info('[QuantumDefense] Bootstrap complete — Cảnh Vệ đã sẵn sàng');
}
