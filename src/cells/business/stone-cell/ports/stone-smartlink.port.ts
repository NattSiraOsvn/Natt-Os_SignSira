// @ts-nocheck
import { forgeSmartLinkPort } from '@/satellites/port-forge';

export const StoneSmartLinkPort = forgeSmartLinkPort({
  cellId: 'stone-cell',
  signals: {
    DIAMOND_LOSS: { eventType: "DiamondLossDetected", routeTo: "audit-cell" },

    WIP_IN_PROGRESS: { eventType: 'wip:in-progress', routeTo: 'finishing-cell' },
    WIP_STONE: { eventType: 'wip:stone', routeTo: 'polishing-cell' },
  }
});
