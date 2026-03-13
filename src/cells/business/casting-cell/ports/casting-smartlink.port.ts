// @ts-nocheck
import { forgeSmartLinkPort } from '@/satellites/port-forge';

export const CastingSmartLinkPort = forgeSmartLinkPort({
  cellId: 'casting-cell',
  signals: {
    CASTING_REQUEST: { eventType: 'casting:request', routeTo: 'prdmaterials-cell' },
    WIP_PHOI: { eventType: 'wip:phoi', routeTo: 'finishing-cell' },
  }
});
