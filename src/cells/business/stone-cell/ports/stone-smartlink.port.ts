import { forgeSmartLinkPort } from '@/satellites/port-forge/port.factory';

export const StoneSmartLinkPort = forgeSmartLinkPort({
  cellId: 'stone-cell',
  signals: {
    subscribes: { WIP_IN_PROGRESS: 'wip:in-progress' },
    emits: { WIP_STONE: 'wip:stone:completed' }
  }
});
