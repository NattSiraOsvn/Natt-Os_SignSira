// @ts-nocheck
// order-cell/ports/order.smartlink.port.ts
import { forgeSmartLinkPort } from '@/satellites/port-forge';

export const OrderSmartLinkPort = forgeSmartLinkPort({
  cellId: 'order-cell',
  signals: {
    // SX-CT → showroom-cell xử lý
    ORDER_SX_CT: { eventType: 'SalesOrderCreated', routeTo: 'showroom-cell' },
    // SX-KD → sales-cell xử lý
    ORDER_SX_KD: { eventType: 'SalesOrderCreated', routeTo: 'sales-cell' },
  },
});
