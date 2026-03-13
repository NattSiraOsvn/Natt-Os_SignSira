// @ts-nocheck
import { forgeSmartLinkPort } from '@/satellites/port-forge';
export const PrdMaterialsSmartLinkPort = forgeSmartLinkPort({
  cellId: 'prdmaterials-cell',
  signals: {
    ORDER_CREATED:    { eventType: 'order:created',    routeTo: 'prdmaterials-cell' },
    CASTING_REQUEST:  { eventType: 'casting:request',  routeTo: 'casting-cell' },
  },
});
