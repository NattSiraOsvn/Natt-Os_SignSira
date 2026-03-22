// @ts-nocheck
// finishing-cell/domain/services/finishing.engine.ts
// Wave 5b — nhận wip:phoi (từ casting), ráp chi tiết, emit → polishing-cell
import { EventBus } from '@/core/events/event-bus';
import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

const _touch: TouchRecord[] = [];
function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'finishing-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
  EventBus.publish({ type: signal as any, payload }, 'finishing-cell', undefined);
}

EventBus.subscribe('wip:phoi' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId) return;
  // Sau ráp chi tiết xong → polishing-cell
  _emit('polishing-cell', 'wip:in-progress' as any, {
    orderId: p.orderId, maDon: p.maDon, maHang: p.maHang,
    finishStatus: 'DONE', source: 'finishing-cell',
  });
}, 'finishing-cell');

export const FinishingEngine = { getHistory: (): TouchRecord[] => [..._touch] };
