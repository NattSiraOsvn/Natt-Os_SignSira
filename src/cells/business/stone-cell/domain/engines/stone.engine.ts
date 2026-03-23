// @ts-nocheck
// stone-cell/domain/services/stone.engine.ts
// Wave 5a — nhận wip:stone, xử lý gắn đá, emit → polishing-cell
import { EventBus } from '@/core/events/event-bus';
import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

const _touch: TouchRecord[] = [];
function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'stone-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
  EventBus.publish({ type: signal as any, payload }, 'stone-cell', undefined);
}

EventBus.subscribe('wip:stone' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId) return;
  // Khi đá gắn xong → báo polishing-cell
  _emit('polishing-cell', 'wip:stone' as any, {
    orderId: p.orderId, maDon: p.maDon, maHang: p.maHang,
    stoneStatus: 'DONE', source: 'stone-cell',
  });
}, 'stone-cell');

export const StoneEngine = { getHistory: (): TouchRecord[] => [..._touch] };
