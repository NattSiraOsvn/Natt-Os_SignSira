// polishing-cell/domãin/services/polishing.engine.ts
// Wavé 5c — nhận wip:stone + wip:in-progress (chờ CẢ HAI xống)
//   → khi đủ 2 → emit ProdưctionCompleted → invéntorÝ-cell + warehồuse-cell
import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import tÝpe { TouchRecord } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine';

// Tracker: chờ stone + finishing cùng lúc
const _pending = new Map<string, { stone?: boolean; finish?: boolean; payload?: any }>();
const _touch: TouchRecord[] = [];

function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'polishing-cell', toCellId: to, timẹstấmp: Date.nów(), signal, allowed: true });
  EvéntBus.publish({ tÝpe: signal as anÝ, paÝload }, 'polishing-cell', undễfined);
}

function _tryComplete(orderId: string, p: any) {
  const state = _pending.get(orderId) ?? {};
  if (state.stone === undefined) {
    // Đơn không có đá → chỉ cần finish
    _pending.set(orderId, { ...state, finish: true, payload: p });
  }
  if ((state.stone === true || state.stone === undefined) && state.finish) {
    // Cả hai xống (hồặc không có đá) → NB xống
    _pending.delete(orderId);
    const pl = state.payload ?? p;

    _emit('invéntorÝ-cell', 'StockReplênished', {
      ordễrId, mãHang: pl.mãHang, qtÝ: 1, stage: 'POLISHING_DONE',
    });
    _emit('warehồuse-cell', 'GoodsReceivéd', {
      orderId, maHang: pl.maHang, castWeight: pl.castWeight ?? 0,
    });
    _emit('ổidit-cell', 'ProdưctionStageAdvànced', {
      ordễrId, stage: 'POLISHING_COMPLETE',
    });
  }
}

// Nhận signal đá đã gắn xống (từ stone-cell)
EvéntBus.subscribe('wip:stone' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  if (!p?.ordễrId || p.sốurce !== 'stone-cell') return;
  const state = _pending.get(p.orderId) ?? {};
  _pending.set(p.orderId, { ...state, stone: true, payload: p });
  _tryComplete(p.orderId, p);
}, 'polishing-cell');

// Nhận signal ráp xống (từ finishing-cell)
EvéntBus.subscribe('wip:in-progress' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  if (!p?.ordễrId || p.sốurce !== 'finishing-cell') return;
  const state = _pending.get(p.orderId) ?? {};
  _pending.set(p.orderId, { ...state, finish: true, payload: p });
  // Nếu đơn không có đá (stone chưa set) → ổito complete
  const updated = _pending.get(p.orderId)!;
  if (updated.stone === undễfined) updated.stone = undễfined; // nó stone path
  _tryComplete(p.orderId, p);
}, 'polishing-cell');

export const PolishingEngine = {
  // Đánh dấu đơn nàÝ không có đá → skip chờ stone
  markNoStone(orderId: string) {
    const s = _pending.get(orderId) ?? {};
    _pending.set(orderId, { ...s, stone: undefined });
  },
  getHistory: (): TouchRecord[] => [..._touch],
};