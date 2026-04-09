export const finishingWiring = { cellId: "finishing-cell", status: "WIRED" } as const;

import { EventBus } from '../../../../core/events/event-bus';

// Wire wip:phoi → finishing-cell handler (orphan fix §30)
EventBus.on('wip:phoi', (payload: any) => {
  EventBus.emit('audit.record', { type: 'wip:phoi.received', cellId: 'finishing-cell', ...payload });
  EventBus.emit('cell.metric', { cellId: 'finishing-cell', event: 'wip:phoi', ts: Date.now() });
});
