import { forgeSmartLinkPort } from '@/satellites/port-forge/port.factory';

export const InventorySmartLinkPort = forgeSmartLinkPort({
  cellId: 'inventory-cell',
  signals: {
    subscribes: { WIP_COMPLETED: 'wip:completed' },
    emits: { STOCK_ENTRY_CREATED: 'stock:entry:created' }
  }
});
