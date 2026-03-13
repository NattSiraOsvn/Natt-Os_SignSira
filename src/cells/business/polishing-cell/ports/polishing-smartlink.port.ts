// @ts-nocheck
import { forgeSmartLinkPort } from '@/satellites/port-forge';

export const PolishingSmartLinkPort = forgeSmartLinkPort({
  cellId: 'polishing-cell',
  signals: {
    WIP_STONE: { eventType: 'wip:stone', routeTo: 'stone-cell' },
    WIP_COMPLETED: { eventType: 'wip:completed', routeTo: 'inventory-cell' },
  }
});
