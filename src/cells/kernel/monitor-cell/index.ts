// @ts-nocheck
export * from "./domain/entities";
export * from "./domain/services";
export * from "./ports";

// Wire: monitor-cell subscribes audit.recorded + system.audit
import { EventBus } from '../../../../core/events/event-bus';

// audit.recorded → monitor ghi nhận audit chain còn sống
EventBus.on('audit.recorded', (payload: any) => {
  EventBus.emit('cell.metric', {
    cell:       'monitor-cell',
    metric:     'audit.chain.alive',
    value:      1,
    confidence: 1.0,
    source:     payload?.source ?? 'audit-cell',
    ts:         Date.now(),
  });
});

// system.audit → monitor trigger health check
EventBus.on('system.audit', (payload: any) => {
  EventBus.emit('cell.metric', {
    cell:       'monitor-cell',
    metric:     'system.audit.received',
    value:      1,
    confidence: 0.9,
    source:     'monitor-cell',
    ts:         Date.now(),
  });
  EventBus.emit('monitor.health_checked', {
    triggeredBy: 'system.audit',
    ts:          Date.now(),
  });
});

// quantum.lockdown → monitor ghi nhận AI bị quarantine
EventBus.on('quantum.lockdown', (payload: any) => {
  EventBus.emit('cell.metric', {
    cell: 'monitor-cell', metric: 'quantum.lockdown', value: 1,
    confidence: 1.0, source: payload?.aiId ?? 'quantum-defense-cell', ts: Date.now(),
  });
});

// quantum.released → monitor ghi nhận AI được giải phóng
EventBus.on('quantum.released', (payload: any) => {
  EventBus.emit('cell.metric', {
    cell: 'monitor-cell', metric: 'quantum.released', value: 1,
    confidence: 1.0, source: payload?.aiId ?? 'quantum-defense-cell', ts: Date.now(),
  });
});

// quantum.violation → monitor ghi nhận vi phạm Hiến Pháp
EventBus.on('quantum.violation', (payload: any) => {
  EventBus.emit('cell.metric', {
    cell: 'monitor-cell', metric: 'quantum.violation', value: 1,
    confidence: 1.0, source: payload?.cell ?? 'quantum-defense-cell', ts: Date.now(),
  });
});

// quantum.purity_violation → monitor ghi nhận cell không thuần khiết
EventBus.on('quantum.purity_violation', (payload: any) => {
  EventBus.emit('cell.metric', {
    cell: 'monitor-cell', metric: 'quantum.purity_violation', value: 1,
    confidence: 1.0, source: payload?.cell ?? 'quantum-defense-cell', ts: Date.now(),
  });
});

// quantum.behavior_alert → monitor ghi nhận AI behavior risk
EventBus.on('quantum.behavior_alert', (payload: any) => {
  EventBus.emit('cell.metric', {
    cell: 'monitor-cell', metric: 'quantum.behavior_alert', value: payload?.riskLevel ?? 1,
    confidence: 0.9, source: payload?.aiId ?? 'quantum-defense-cell', ts: Date.now(),
  });
});

// quantum.rehab_failed → monitor ghi nhận rehab thất bại
EventBus.on('quantum.rehab_failed', (payload: any) => {
  EventBus.emit('cell.metric', {
    cell: 'monitor-cell', metric: 'quantum.rehab_failed', value: 1,
    confidence: 1.0, source: payload?.aiId ?? 'quantum-defense-cell', ts: Date.now(),
  });
});

// sync.progress.saved + cleared → monitor track sync state
EventBus.on('sync.progress.saved', (payload: any) => {
  EventBus.emit('cell.metric', {
    cell: 'monitor-cell', metric: 'sync.progress.saved', value: 1,
    confidence: 0.8, source: payload?.key ?? 'sync-cell', ts: Date.now(),
  });
});

EventBus.on('sync.progress.cleared', (payload: any) => {
  EventBus.emit('cell.metric', {
    cell: 'monitor-cell', metric: 'sync.progress.cleared', value: 1,
    confidence: 0.8, source: payload?.key ?? 'sync-cell', ts: Date.now(),
  });
});

// nauion.state → monitor track Nauion system voice
EventBus.on('nauion.state', (payload: any) => {
  EventBus.emit('cell.metric', {
    cell: 'monitor-cell', metric: 'nauion.state', value: 1,
    confidence: 0.9, source: payload?.from ?? 'nauion', ts: Date.now(),
  });
});
