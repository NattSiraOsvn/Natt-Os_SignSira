// @ts-nocheck
// inventory-cell/domain/services/inventory.engine.ts
// Wave 6a — nhận StockReplenished → emit → pricing-cell
import { EventBus } from '@/core/events/event-bus';
import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

const _touch: TouchRecord[] = [];
function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'inventory-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
  EventBus.publish({ type: signal as any, payload }, 'inventory-cell', undefined);
}

EventBus.subscribe('StockReplenished' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId) return;
  // Cập nhật tồn kho xong → pricing-cell tính giá
  _emit('pricing-cell', 'StockReplenished', {
    orderId: p.orderId, maHang: p.maHang, qty: p.qty,
    action: 'PRICE_NEW_STOCK',
  });
}, 'inventory-cell');

export const InventoryEngine = { getHistory: (): TouchRecord[] => [..._touch] };
