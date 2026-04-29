
export * from './application/index';
export * from './ports/index';
export * from './domain/engines/notification.engine';
export * from './smartlink/index';

import { EventBus } from '../../../core/events/event-bus';

// notification-cell: emit cell.metric khi nhận audit.recorded
EventBus.on('audit.recorded', (payload: any) => {
  EventBus.emit('cell.metric', {
    cell:       'notification-cell',
    metric:     'notification.ready',
    value:      1,
    confidence: 0.9,
    source:     payload?.source ?? 'audit-cell',
    ts:         Date.now(),
  });
});
