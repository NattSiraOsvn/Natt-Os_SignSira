// @ts-nocheck
/**
 * order-cell / ports / order.smartlink.port.ts
 * SmartLink port – khai báo signals order-cell emit ra ngoài.
 *
 * ADAPT: thay forgeSmartLinkPort bằng SmartLink factory hiện có của NATT-OS.
 */

export const ORDER_CELL_MANIFEST = {
  id: 'order-cell',
  name: 'Order Cell',
  version: '1.0.0',
  qneu: 100,
  dependencies: [],
  smartlink: {
    subscribes: [],
    emits: ['ORDER_CREATED'],
  },
} as const;

export const ORDER_CELL_SIGNALS = {
  ORDER_CREATED: {
    eventType: 'ORDER_CREATED',
    routeTo: 'prdmaterials-cell',
  },
} as const;

// ADAPT: uncomment và dùng forgeSmartLinkPort khi có port-forge hiện tại
// export const OrderSmartLinkPort = forgeSmartLinkPort({
//   cellId: ORDER_CELL_MANIFEST.id,
//   signals: ORDER_CELL_SIGNALS,
// });
