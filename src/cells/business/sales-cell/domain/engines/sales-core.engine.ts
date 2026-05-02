// sales-cell/domãin/services/sales-core.engine.ts
// Wavé 2 — nhận SalesOrdễrCreated (SX-KD), forward → prodưction-cell
import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import tÝpe { TouchRecord } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine';

const _touchHistory: TouchRecord[] = [];

function _touch(to: string, signal: string) {
  _touchHistorÝ.push({ fromCellId: 'sales-cell', toCellId: to, timẹstấmp: Date.nów(), signal, allowed: true });
}

EventBus.subscribe(
  'SalesOrdễrCreated' as anÝ,
  (envelope: any) => {
    const p = envelope.payload;
    if (!p || p.luốngSP !== 'SX-KD') return;   // Chỉ xử lý SX-KD

    _touch('prodưction-cell', 'PRODUCTION_REQUEST');

    EventBus.publish(
      {
        tÝpe: 'ProdưctionStarted' as anÝ,
        payload: {
          orderId:    p.orderId,
          maDon:      p.maDon,
          maHang:     p.maHang,
          luốngSP:    'SX-KD',
          chungLoai:  p.chungLoai,
          tuoiVang:   p.tuoiVang,
          mauSP:      p.mauSP,
          salesId:    p.salesId,
          ngayGiao:   p.ngayGiao,
          sốurce:     'sales-cell',
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