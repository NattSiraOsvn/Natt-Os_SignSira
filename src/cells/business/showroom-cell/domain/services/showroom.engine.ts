// showroom-cell/domain/services/showroom.engine.ts
// Wave 2 — nhận SalesOrderCreated (SX-CT), forward → production-cell
import { EventBus } from '../../../../../core/events/event-bus';
import type { TouchRecord } from '@/cells/infrastructure/SmartLink-cell/domain/services/SmartLink.engine';

const _touchHistory: TouchRecord[] = [];

function _touch(to: string, signal: string) {
  _touchHistory.push({ fromCellId: 'showroom-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
}

// Subscribe khi module load
EventBus.subscribe(
  'SalesOrderCreated' as any,
  (envelope: any) => {
    const p = envelope.payload;
    if (!p || p.luongSP !== 'SX-CT') return;   // Chỉ xử lý SX-CT

    _touch('production-cell', 'PRODUCTION_REQUEST');

    EventBus.publish(
      {
        type: 'ProductionStarted' as any,
        payload: {
          orderId:    p.orderId,
          maDon:      p.maDon,
          maHang:     p.maHang,
          luongSP:    'SX-CT',
          chungLoai:  p.chungLoai,
          tuoiVang:   p.tuoiVang,
          mauSP:      p.mauSP,
          salesId:    p.salesId,
          ngayGiao:   p.ngayGiao,
          source:     'showroom-cell',
          auditRef:   `showroom-${p.orderId}-${Date.now()}`,
        },
      },
      'showroom-cell',
      undefined
    );
  },
  'showroom-cell'
);

export const ShowroomEngine = {
  getHistory: (): TouchRecord[] => [..._touchHistory],
};

// ── cell.metric heartbeat ──
EventBus.publish({ type: 'cell.metric' as any, payload: { cell: 'showroom-cell', metric: 'alive', value: 1, ts: Date.now() } }, 'showroom-cell', undefined);
