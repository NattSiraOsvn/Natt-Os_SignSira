import { forgeSmartLinkPort } from '@/satellites/port-forge/port.factory';

export const PolishingSmartLinkPort = forgeSmartLinkPort({
  cellId: 'polishing-cell',
  signals: {
    subscribes: { WIP_STONE: 'wip:stone:completed' },
    emits: { WIP_COMPLETED: 'wip:completed' }
  }
});
