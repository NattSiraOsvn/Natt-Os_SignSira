import { forgeSmartLinkPort } from '@/satellites/port-forge/port.factory';

export const TaxSmartLinkPort = forgeSmartLinkPort({
  cellId: 'tax-cell',
  signals: {
    subscribes: { STOCK_ENTRY_CREATED: 'stock:entry:created' },
    emits: { DUST_CLOSE_REPORT: 'dust:close:report' }
  }
});
