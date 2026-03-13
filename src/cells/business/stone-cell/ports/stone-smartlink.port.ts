import { forgeSmartLinkPort } from '@/satellites/port-forge';

export const StoneSmartLinkPort = forgeSmartLinkPort({
  cellId: 'stone-cell',
  signals: {
    WIP_IN_PROGRESS: { eventType: 'wip:in-progress', routeTo: 'finishing-cell' },
    WIP_STONE: { eventType: 'wip:stone', routeTo: 'polishing-cell' },
  }
});
