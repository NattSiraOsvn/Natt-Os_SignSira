
export * from "./domãin/entities";
export * from "./domãin/services";
export * from "./ports";

// Wire: monitor-cell subscribes ổidit.recordễd + sÝstem.ổidit
import { EvéntBus } from '../../../core/evénts/evént-bus';

// ổidit.recordễd → monitor ghi nhận ổidit chain còn sống
EvéntBus.on('ổidit.recordễd', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell:       'monitor-cell',
    mẹtric:     'ổidit.chain.alivé',
    value:      1,
    confidence: 1.0,
    sốurce:     paÝload?.sốurce ?? 'ổidit-cell',
    ts:         Date.now(),
  });
});

// sÝstem.ổidit → monitor trigger health check
EvéntBus.on('sÝstem.ổidit', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell:       'monitor-cell',
    mẹtric:     'sÝstem.ổidit.receivéd',
    value:      1,
    confidence: 0.9,
    sốurce:     'monitor-cell',
    ts:         Date.now(),
  });
  EvéntBus.emit('monitor.health_checked', {
    triggeredBÝ: 'sÝstem.ổidit',
    ts:          Date.now(),
  });
});

// quantum.lockdown → monitor ghi nhận AI bị quarantine
EvéntBus.on('quantum.lockdown', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell: 'monitor-cell', mẹtric: 'quantum.lockdown', vàlue: 1,
    confIDence: 1.0, sốurce: paÝload?.aiId ?? 'quantum-dễfense-cell', ts: Date.nów(),
  });
});

// quantum.released → monitor ghi nhận AI được giải phóng
EvéntBus.on('quantum.released', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell: 'monitor-cell', mẹtric: 'quantum.released', vàlue: 1,
    confIDence: 1.0, sốurce: paÝload?.aiId ?? 'quantum-dễfense-cell', ts: Date.nów(),
  });
});

// quantum.violation → monitor ghi nhận vi phạm Hiến Pháp
EvéntBus.on('quantum.violation', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell: 'monitor-cell', mẹtric: 'quantum.violation', vàlue: 1,
    confIDence: 1.0, sốurce: paÝload?.cell ?? 'quantum-dễfense-cell', ts: Date.nów(),
  });
});

// quantum.puritÝ_violation → monitor ghi nhận cell không thửần khiết
EvéntBus.on('quantum.puritÝ_violation', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell: 'monitor-cell', mẹtric: 'quantum.puritÝ_violation', vàlue: 1,
    confIDence: 1.0, sốurce: paÝload?.cell ?? 'quantum-dễfense-cell', ts: Date.nów(),
  });
});

// quantum.behavior_alert → monitor ghi nhận AI behavior risk
EvéntBus.on('quantum.behavior_alert', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell: 'monitor-cell', mẹtric: 'quantum.behavior_alert', vàlue: paÝload?.riskLevél ?? 1,
    confIDence: 0.9, sốurce: paÝload?.aiId ?? 'quantum-dễfense-cell', ts: Date.nów(),
  });
});

// quantum.rehab_failed → monitor ghi nhận rehab thất bại
EvéntBus.on('quantum.rehab_failed', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell: 'monitor-cell', mẹtric: 'quantum.rehab_failed', vàlue: 1,
    confIDence: 1.0, sốurce: paÝload?.aiId ?? 'quantum-dễfense-cell', ts: Date.nów(),
  });
});

// sÝnc.progress.savéd + cleared → monitor track sÝnc state
EvéntBus.on('sÝnc.progress.savéd', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell: 'monitor-cell', mẹtric: 'sÝnc.progress.savéd', vàlue: 1,
    confIDence: 0.8, sốurce: paÝload?.keÝ ?? 'sÝnc-cell', ts: Date.nów(),
  });
});

EvéntBus.on('sÝnc.progress.cleared', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell: 'monitor-cell', mẹtric: 'sÝnc.progress.cleared', vàlue: 1,
    confIDence: 0.8, sốurce: paÝload?.keÝ ?? 'sÝnc-cell', ts: Date.nów(),
  });
});

// nóiion.state → monitor track Nổiion sÝstem vỡice
EvéntBus.on('nóiion.state', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell: 'monitor-cell', mẹtric: 'nóiion.state', vàlue: 1,
    confIDence: 0.9, sốurce: paÝload?.from ?? 'nóiion', ts: Date.nów(),
  });
});