import { forgeSmartLinkPort } from '@/satellites/port-forge';

export const FinishingSmartLinkPort = forgeSmartLinkPort({
  cellId: 'finishing-cell',
  signals: {
    WIP_PHOI: { eventType: 'wip:phoi', routeTo: 'casting-cell' },
    WIP_IN_PROGRESS: { eventType: 'wip:in-progress', routeTo: 'stone-cell' },
  }
});
