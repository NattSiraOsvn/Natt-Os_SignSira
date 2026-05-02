import { EventBus } from '../../../../../core/events/event-bus';
import { NotifyBus } from '../services/notify-bus';

export const notifyEngine = {
  send: (type: 'INFO'|'warnING'|'error'|'SUCCESS'|'NEWS'|'RISK'|'ORDER', title: string, content: string) => {
    NotifyBus.push({ type, title, content });
    EventBus.emit('cell.metric', {
      cell: 'notification-cell', metric: 'notification.sent', value: 1,
      confidence: 0.9, source: 'notification-cell', ts: Date.now(),
    });
  },
};
