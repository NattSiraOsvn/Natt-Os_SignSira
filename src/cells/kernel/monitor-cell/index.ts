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
