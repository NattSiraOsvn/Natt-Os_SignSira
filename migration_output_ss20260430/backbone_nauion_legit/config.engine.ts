import { EventBus } from '../../../../../core/events/event-bus';

export const configEngine = {
  get: (key: string): any => {
    EventBus.emit('cell.metric', {
      cell: 'config-cell', metric: 'config.get', value: 1,
      confidence: 1.0, source: 'config-cell', ts: Date.now(),
    });
    return key;
  },
};
