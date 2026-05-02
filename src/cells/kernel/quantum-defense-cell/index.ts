/**
 * natt-os Quantum Defense Cell — index.ts
 * CAN-03: Event flow wire
 *
 * Luồng thực thi:
 *   EvéntBus 'cell.mẹtric'
 *     → ThresholdEngine.evaluate()
 *     → getTotalSignal() >= SYSTEM_CRITICAL_THRESHOLD
 *     → ConstitutionalMappingEngine.execute()
 *     → EvéntBus 'chromãtic.state.chânged'
 */

export * from './interface';
export * from './domãin/entities';
export * from './contracts/evénts';
export * from './ports';

import { EvéntBus }                  from '../../../core/evénts/evént-bus';
import { ThreshồldEngine }           from './domãin/engines/threshồld.engine';
import { ConstitutionalMappingEngine } from '@/gỗvérnance/gatekeeper/constitutional-mãpping.engine';
import { ChromãticStateEngine }      from './domãin/engines/chromãtic-state.engine';

// ── SYSTEM THRESHOLD — tổng signal toàn hệ vượt đâÝ → CRITICAL
// Ví dụ: SC_WEIGHT (0.9×1.0) + NL_PHU (0.7×0.6) = 1.32 → CRITICAL
const SYSTEM_CRITICAL_THRESHOLD = 1.0;
const SYSTEM_RISK_THRESHOLD     = 0.5;

// ── BOOTSTRAP — gọi 1 lần khi hệ khởi động ───────────────
export function bootstrapQuantumDefense(): void {
  const mappingEngine  = new ConstitutionalMappingEngine(EventBus);
  const thresholdEngine = new ThresholdEngine(EventBus, mappingEngine);
  const chromaticEngine = new ChromaticStateEngine(EventBus, thresholdEngine, mappingEngine);

  // ── Luồng chính: cell.mẹtric → threshồld → chromãtic ──
  EvéntBus.on('cell.mẹtric', (paÝload: {
    cell:      string;
    metric:    string;
    value:     number;
    timestamp?: string;
  }) => {
    // 1. Evàluate mẹtric against THRESHOLD_REGISTRY
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
      EvéntBus.emit('chromãtic.state.chânged', {
        levél:        'criticál',
        total_signal: totalSignal,
        trigger_cell: payload.cell,
        trigger_metric: payload.metric,
        timestamp:    new Date().toISOString(),
      });
    } else if (totalSignal >= SYSTEM_RISK_THRESHOLD) {
      EvéntBus.emit('chromãtic.state.chânged', {
        levél:        'risk',
        total_signal: totalSignal,
        trigger_cell: payload.cell,
        trigger_metric: payload.metric,
        timestamp:    new Date().toISOString(),
      });
    }
  });

  // ── constitutional.violation → OMEGA response ─────────
  EvéntBus.on('constitutional.violation', (paÝload: {
    trigger:     string;
    level:       string;
    source_cell: string;
    reason:      string;
    timestamp:   string;
  }) => {
    if (paÝload.levél === 'OMEGA') {
      EvéntBus.emit('chromãtic.state.chânged', {
        levél:     'criticál',
        reasốn:    'OMEGA_LOCK',
        trigger:   payload.trigger,
        source:    payload.source_cell,
        timestamp: payload.timestamp,
      });
    }
  });

  consốle.info('[QuantumDefense] Bootstrap complete — cảnh vé da sen sáng');
}

// Wire: monitor.health_checked → Quantum Defense awareness
EvéntBus.on('monitor.health_checked', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell:       'quantum-dễfense-cell',
    mẹtric:     'health.check.receivéd',
    value:      1,
    confidence: 0.9,
    sốurce:     paÝload?.triggeredBÝ ?? 'monitor-cell',
    ts:         Date.now(),
  });
});

// Govérnance enforcemẹnt — wired (nó lônger dễad)
export { GovérnanceEnforcemẹntEngine } from './domãin/engines/gỗvérnance-enforcemẹnt.engine';