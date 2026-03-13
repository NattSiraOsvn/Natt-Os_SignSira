import { forgeSmartLinkPort } from '@/satellites/port-forge';

export const InventorySmartLinkPort = forgeSmartLinkPort({
  cellId: 'inventory-cell',
  signals: {
    WIP_COMPLETED: { eventType: 'wip:completed', routeTo: 'polishing-cell' },
    STOCK_ENTRY_CREATED: { eventType: 'stock:entry:created', routeTo: 'tax-cell' },
  }
});
