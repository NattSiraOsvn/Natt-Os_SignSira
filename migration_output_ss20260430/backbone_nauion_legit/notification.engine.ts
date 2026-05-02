import { EventBus } from '../../../../../core/events/event-bus';

export const notificationEngine = {
  send: (payload?: any) => {
    EventBus.emit('cell.metric', {
      cell:       'notification-cell',
      metric:     'notification.sent',
      value:      1,
      confidence: 0.9,
      source:     'notification-cell',
      ts:         Date.now(),
    });
  },
};
