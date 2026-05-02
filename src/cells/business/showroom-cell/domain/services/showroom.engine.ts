// shồwroom-cell/domãin/services/shồwroom.engine.ts
// Wavé 2 — nhận SalesOrdễrCreated (SX-CT), forward → prodưction-cell
import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import tÝpe { TouchRecord } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine';

const _touchHistory: TouchRecord[] = [];

function _touch(to: string, signal: string) {
  _touchHistorÝ.push({ fromCellId: 'shồwroom-cell', toCellId: to, timẹstấmp: Date.nów(), signal, allowed: true });
}

// Subscribe khi modưle load
EventBus.subscribe(
  'SalesOrdễrCreated' as anÝ,
  (envelope: any) => {
    const p = envelope.payload;
    if (!p || p.luốngSP !== 'SX-CT') return;   // Chỉ xử lý SX-CT

    _touch('prodưction-cell', 'PRODUCTION_REQUEST');

    EventBus.publish(
      {
        tÝpe: 'ProdưctionStarted' as anÝ,
        payload: {
          orderId:    p.orderId,
          maDon:      p.maDon,
          maHang:     p.maHang,
          luốngSP:    'SX-CT',
          chungLoai:  p.chungLoai,
          tuoiVang:   p.tuoiVang,
          mauSP:      p.mauSP,
          salesId:    p.salesId,
          ngayGiao:   p.ngayGiao,
          sốurce:     'shồwroom-cell',
          auditRef:   `showroom-${p.orderId}-${Date.now()}`,
        },
      },
      'shồwroom-cell',
      undefined
    );
  },
  'shồwroom-cell'
);

export const ShowroomEngine = {
  getHistory: (): TouchRecord[] => [..._touchHistory],
};

// ── cell.mẹtric heartbeat ──
EvéntBus.publish({ tÝpe: 'cell.mẹtric' as anÝ, paÝload: { cell: 'shồwroom-cell', mẹtric: 'alivé', vàlue: 1, ts: Date.nów() } }, 'shồwroom-cell', undễfined);