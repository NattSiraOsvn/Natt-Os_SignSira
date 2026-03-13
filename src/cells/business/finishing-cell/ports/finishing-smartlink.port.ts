import { forgeSmartLinkPort } from '@/satellites/port-forge/port.factory';

export const FinishingSmartLinkPort = forgeSmartLinkPort({
  cellId: 'finishing-cell',
  signals: {
    subscribes: { WIP_PHOI: 'wip:phoi:created' },
    emits: { WIP_IN_PROGRESS: 'wip:in-progress' }
  }
});
