// sales-cell/domain/services/sales-core.engine.ts
// Wave 2 — nhận SalesOrderCreated (SX-KD), forward → production-cell
import { EventBus } from '../../../../../core/events/event-bus';
import type { TouchRecord } from '@/cells/infrastructure/SmartLink-cell/domain/services/SmartLink.engine';

const _touchHistory: TouchRecord[] = [];

function _touch(to: string, signal: string) {
  _touchHistory.push({ fromCellId: 'sales-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
}

EventBus.subscribe(
  'SalesOrderCreated' as any,
  (envelope: any) => {
    const p = envelope.payload;
    if (!p || p.luongSP !== 'SX-KD') return;   // Chỉ xử lý SX-KD

    _touch('production-cell', 'PRODUCTION_REQUEST');

    EventBus.publish(
      {
        type: 'ProductionStarted' as any,
        payload: {
          orderId:    p.orderId,
          maDon:      p.maDon,
          maHang:     p.maHang,
          luongSP:    'SX-KD',
          chungLoai:  p.chungLoai,
          tuoiVang:   p.tuoiVang,
          mauSP:      p.mauSP,
          salesId:    p.salesId,
          ngayGiao:   p.ngayGiao,
          source:     'sales-cell',
          auditRef:   `sales-${p.orderId}-${Date.now()}`,
        },
      },
      'sales-cell',
      undefined
    );
  },
  'sales-cell'
);

export const SalesCoreEngine = {
  getHistory: (): TouchRecord[] => [..._touchHistory],
};
