// @ts-nocheck
// polishing-cell/domain/services/polishing.engine.ts
// Wave 5c — nhận wip:stone + wip:in-progress (chờ CẢ HAI xong)
//   → khi đủ 2 → emit ProductionCompleted → inventory-cell + warehouse-cell
import { EventBus } from '@/core/events/event-bus';
import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

// Tracker: chờ stone + finishing cùng lúc
const _pending = new Map<string, { stone?: boolean; finish?: boolean; payload?: any }>();
const _touch: TouchRecord[] = [];

function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'polishing-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
  EventBus.publish({ type: signal as any, payload }, 'polishing-cell', undefined);
}

function _tryComplete(orderId: string, p: any) {
  const state = _pending.get(orderId) ?? {};
  if (state.stone === undefined) {
    // Đơn không có đá → chỉ cần finish
    _pending.set(orderId, { ...state, finish: true, payload: p });
  }
  if ((state.stone === true || state.stone === undefined) && state.finish) {
    // Cả hai xong (hoặc không có đá) → NB xong
    _pending.delete(orderId);
    const pl = state.payload ?? p;

    _emit('inventory-cell', 'StockReplenished', {
      orderId, maHang: pl.maHang, qty: 1, stage: 'POLISHING_DONE',
    });
    _emit('warehouse-cell', 'GoodsReceived', {
      orderId, maHang: pl.maHang, castWeight: pl.castWeight ?? 0,
    });
    _emit('audit-cell', 'ProductionStageAdvanced', {
      orderId, stage: 'POLISHING_COMPLETE',
    });
  }
}

// Nhận signal đá đã gắn xong (từ stone-cell)
EventBus.subscribe('wip:stone' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId || p.source !== 'stone-cell') return;
  const state = _pending.get(p.orderId) ?? {};
  _pending.set(p.orderId, { ...state, stone: true, payload: p });
  _tryComplete(p.orderId, p);
}, 'polishing-cell');

// Nhận signal ráp xong (từ finishing-cell)
EventBus.subscribe('wip:in-progress' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId || p.source !== 'finishing-cell') return;
  const state = _pending.get(p.orderId) ?? {};
  _pending.set(p.orderId, { ...state, finish: true, payload: p });
  // Nếu đơn không có đá (stone chưa set) → auto complete
  const updated = _pending.get(p.orderId)!;
  if (updated.stone === undefined) updated.stone = undefined; // no stone path
  _tryComplete(p.orderId, p);
}, 'polishing-cell');

export const PolishingEngine = {
  // Đánh dấu đơn này không có đá → skip chờ stone
  markNoStone(orderId: string) {
    const s = _pending.get(orderId) ?? {};
    _pending.set(orderId, { ...s, stone: undefined });
  },
  getHistory: (): TouchRecord[] => [..._touch],
};
