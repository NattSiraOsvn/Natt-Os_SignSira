import { forgeSmartLinkPort } from '@/satellites/port-forge/port.factory';

export const CastingSmartLinkPort = forgeSmartLinkPort({
  cellId: 'casting-cell',
  signals: {
    subscribes: { CASTING_REQUEST: 'casting:request:received' },
    emits: { WIP_PHOI: 'wip:phoi:created' }
  }
});
