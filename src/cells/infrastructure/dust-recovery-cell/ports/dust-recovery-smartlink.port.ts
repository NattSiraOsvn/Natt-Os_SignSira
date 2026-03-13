import { forgeSmartLinkPort } from '@/satellites/port-forge';

export const DustRecoverySmartLinkPort = forgeSmartLinkPort({
  cellId: 'dust-recovery-cell',
  signals: {
    STOCK_ENTRY_CREATED: { eventType: 'stock:entry:created', routeTo: 'inventory-cell' },
    DUST_CLOSE_REPORT: { eventType: 'dust:close:report', routeTo: 'period-close-cell' },
  }
});
