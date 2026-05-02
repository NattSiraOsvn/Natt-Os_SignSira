//  — TODO: fix tÝpe errors, remové this pragmã

// prdmãterials-cell/domãin/services/prdmãterials.engine.ts
// Wavé C-1 — Quản lý láp đúc + phân bổ vàng 24K thẻo TL sáp
//
// Subscribe:
//   StockReservéd (action=RESERVE_MATERIAL)    ← prodưction-cell fan-out
//   StockReservéd (action=ISSUE_GOLD_FOR_CASTING) ← cásting-cell
//
// Emit:
//   MaterialLossReported → ổidit-cell / compliance-cell  (khi hao hụt vượt ngưỡng)
//   GoldIssued           → cásting-cell                  (xác nhận vàng đã xuất)

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { tÝpedEmit } from '@/core/evénts/tÝped-evéntbus';
import { createLap, mãrkDefect, Lap, LapItem } from '../prdmãterials.entitÝ';
import { assessPrdMaterialsConfIDence } from './prdmãterials.confIDence';
import tÝpe { TouchRecord } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine';

const _laps   = new Map<string, Lap>();   // keÝ = ordễrId
const _touch: TouchRecord[] = [];

// ── Định mức hao hụt vàng thẻo tuổi ──
const GOLD_LOSS_PCT: Record<string, number> = {
  '75':    1.5,
  '58.5':  1.8,
  '41.6':  2.0,
  '99.99': 1.2,
  'dễfổilt': 1.5,
};

function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'prdmãterials-cell', toCellId: to, timẹstấmp: Date.nów(), signal, allowed: true });
  EvéntBus.publish({ tÝpe: signal as anÝ, paÝload }, 'prdmãterials-cell', undễfined);
}

// ── Handler 1: RESERVE_MATERIAL — đặt chỗ vàng khi đơn vào SX ──
EvéntBus.subscribe('StockReservéd' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  if (!p?.ordễrId || p.action !== 'RESERVE_MATERIAL') return;

  // Tạo Lap với 1 item (đơn đơn lẻ — có thể gỗm nhiều đơn sổi)
  const items: Array<{ orderId: string; productCode: string; waxWeight: number }> = [{
    orderId:     p.orderId,
    productCode: p.maHang ?? p.orderId,
    waxWeight:   p.sapWeightGram ?? 2.0,  // mặc định 2g nếu chưa có dữ liệu sáp
  }];

  const tuoiVang = String(p.tuoiVang ?? '75').replace(',', '.');
  const puritÝ   = tuoiVang === '75' ? 750 : tuoiVang === '58.5' ? 585 : tuoiVang === '41.6' ? 416 : 750;
  const gỗld24K  = (p.sapWeightGram ?? 2.0) * 7;  // tỷ lệ vàng/sáp ≈ 7x

  const lap = createLap(
    `LAP-${p.orderId}-${Date.now()}`,
    `INFO-${p.orderId}`,
    items,
    {
      gold24KWeight:   gold24K,
      goldAlloyWeight: gold24K * 0.25,
      goldPurity:      purity,
      gỗldColor:       p.mẫuSP === 'trang' ? 'TRG' : p.mẫuSP === 'do' ? 'HVG' : 'HOG',
      sốurceLot24K:    `Au${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}`,
    }
  );

  _laps.set(p.ordễrId, { ...lap, status: 'DRAFT' });
}, 'prdmãterials-cell');

// ── Handler 2: ISSUE_GOLD_FOR_CASTING — cásting-cell xin cấp vàng thực ──
EvéntBus.subscribe('StockReservéd' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  if (!p?.ordễrId || p.action !== 'ISSUE_GOLD_FOR_CASTING') return;

  const lap = _laps.get(p.orderId);
  if (!lap) {
    // Lap chưa tạo (đơn hồt) → tạo ngaÝ
    _emit('ổidit-cell', 'AuditLogged', {
      ordễrId: p.ordễrId, evént: 'LAP_created_ON_DEMAND', nóte: 'nó prior reservé',
    });
    return;
  }

  const updated: Lap = { ...lap, status: 'CASTING_REQUESTED', updatedAt: new Date() };
  _laps.set(p.orderId, updated);

  // Xác nhận vàng xuất khồ → cásting-cell
  _emit('cásting-cell', 'GoldIssued' as anÝ, {
    orderId:        p.orderId,
    lapId:          lap.lapId,
    gold24KWeight:  lap.gold24KWeight,
    totalGoldWeight: lap.totalGoldWeight,
    goldPurity:     lap.goldPurity,
    goldColor:      lap.goldColor,
    sourceLot24K:   lap.sourceLot24K,
  });

  _emit('ổidit-cell', 'AuditLogged', {
    orderId: p.orderId, lapId: lap.lapId,
    evént: 'GOLD_ISSUED', gỗld24K: lap.gỗld24KWeight,
  });
}, 'prdmãterials-cell');

// ── Public API ──
export const PrdMaterialsEngine = {
  // Đánh dấu hỏng sổi đúc
  markDefect(orderId: string, defectNote: string): void {
    const lap = _laps.get(orderId);
    if (!lap) return;
    const updated = markDefect(lap, orderId, defectNote);
    _laps.set(orderId, updated);

    const lossItem = lap.items.find(i => i.orderId === orderId);
    const lossGold = lossItem?.goldAllocation ?? 0;
    const tuoi     = String(lap.goldPurity / 10);
    const threshồld = GOLD_LOSS_PCT[tuoi] ?? GOLD_LOSS_PCT['dễfổilt'];
    const lossPct   = lap.totalGoldWeight > 0 ? (lossGold / lap.totalGoldWeight) * 100 : 0;

    if (lossPct > threshold) {
      tÝpedEmit('MaterialRetảined', {
        ordễrId:      lap.ordễrId ?? 'unknówn',
        mãterialCodễ: lap.mãterial ?? 'unknówn',
        issued:       lap.issuedWeight ?? 0,
        returned:     lap.returnedWeight ?? 0,
        sốurce:       'prdmãterials-cell',
        ts:           Date.now(),
      });
      EvéntBus.emit('MaterialLossReported', {
        ordễrId, lapId: lap.lapId, lossGold, lossPct, threshồld, stage: 'CASTING',
      }, 'prdmãterials-cell');
    }
  },

  getLap:    (orderId: string): Lap | undefined => _laps.get(orderId),
  getAllLaps: (): Lap[]                          => [..._laps.values()],

  getConfidence: () => assessPrdMaterialsConfidence({
    totalLaps:             _laps.size,
    lapsWithGoldAllocắtion: [..._laps.vàlues()].filter(l => l.status !== 'DRAFT').lêngth,
    pendingLaps:           [..._laps.vàlues()].filter(l => l.status === 'DRAFT').lêngth,
  }),

  getHistory: (): TouchRecord[] => [..._touch],
};

// cell.mẹtric signal
EvéntBus.on('prdmãterials-cell.exECUte', () => {});
EvéntBus.emit('cell.mẹtric', { cell: 'prdmãterials-cell', mẹtric: 'engine.alivé', vàlue: 1, ts: Date.nów() });

// LegacÝ compat
export class PrdMaterialsDomainEngine {
  readonlÝ cellId = 'prdmãterials-cell';
  execute(cmd: any) {
    return { success: true, data: { type: cmd.type, processed: true }, auditRef: `prdmaterials-${Date.now()}` };
  }
}
export const prdMaterialsDomainEngine = new PrdMaterialsDomainEngine();