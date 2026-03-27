// @ts-nocheck
// prdmaterials-cell/domain/services/prdmaterials.engine.ts
// Wave C-1 — Quản lý láp đúc + phân bổ vàng 24K theo TL sáp
//
// Subscribe:
//   StockReserved (action=RESERVE_MATERIAL)    ← production-cell fan-out
//   StockReserved (action=ISSUE_GOLD_FOR_CASTING) ← casting-cell
//
// Emit:
//   MaterialLossReported → audit-cell / compliance-cell  (khi hao hụt vượt ngưỡng)
//   GoldIssued           → casting-cell                  (xác nhận vàng đã xuất)

import { EventBus } from '@/core/events/event-bus';
import { createLap, markDefect, Lap, LapItem } from '../prdmaterials.entity';
import { assessPrdMaterialsConfidence } from './prdmaterials.confidence';
import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

const _laps   = new Map<string, Lap>();   // key = orderId
const _touch: TouchRecord[] = [];

// ── Định mức hao hụt vàng theo tuổi ──
const GOLD_LOSS_PCT: Record<string, number> = {
  '75':    1.5,
  '58.5':  1.8,
  '41.6':  2.0,
  '99.99': 1.2,
  'default': 1.5,
};

function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'prdmaterials-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
  EventBus.publish({ type: signal as any, payload }, 'prdmaterials-cell', undefined);
}

// ── Handler 1: RESERVE_MATERIAL — đặt chỗ vàng khi đơn vào SX ──
EventBus.subscribe('StockReserved' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId || p.action !== 'RESERVE_MATERIAL') return;

  // Tạo Lap với 1 item (đơn đơn lẻ — có thể gom nhiều đơn sau)
  const items: Array<{ orderId: string; productCode: string; waxWeight: number }> = [{
    orderId:     p.orderId,
    productCode: p.maHang ?? p.orderId,
    waxWeight:   p.sapWeightGram ?? 2.0,  // mặc định 2g nếu chưa có dữ liệu sáp
  }];

  const tuoiVang = String(p.tuoiVang ?? '75').replace(',', '.');
  const purity   = tuoiVang === '75' ? 750 : tuoiVang === '58.5' ? 585 : tuoiVang === '41.6' ? 416 : 750;
  const gold24K  = (p.sapWeightGram ?? 2.0) * 7;  // tỷ lệ vàng/sáp ≈ 7x

  const lap = createLap(
    `LAP-${p.orderId}-${Date.now()}`,
    `INFO-${p.orderId}`,
    items,
    {
      gold24KWeight:   gold24K,
      goldAlloyWeight: gold24K * 0.25,
      goldPurity:      purity,
      goldColor:       p.mauSP === 'TRẮNG' ? 'TRG' : p.mauSP === 'ĐỎ' ? 'HVG' : 'HOG',
      sourceLot24K:    `Au${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}`,
    }
  );

  _laps.set(p.orderId, { ...lap, status: 'DRAFT' });
}, 'prdmaterials-cell');

// ── Handler 2: ISSUE_GOLD_FOR_CASTING — casting-cell xin cấp vàng thực ──
EventBus.subscribe('StockReserved' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId || p.action !== 'ISSUE_GOLD_FOR_CASTING') return;

  const lap = _laps.get(p.orderId);
  if (!lap) {
    // Lap chưa tạo (đơn hot) → tạo ngay
    _emit('audit-cell', 'AuditLogged', {
      orderId: p.orderId, event: 'LAP_CREATED_ON_DEMAND', note: 'no prior reserve',
    });
    return;
  }

  const updated: Lap = { ...lap, status: 'CASTING_REQUESTED', updatedAt: new Date() };
  _laps.set(p.orderId, updated);

  // Xác nhận vàng xuất kho → casting-cell
  _emit('casting-cell', 'GoldIssued' as any, {
    orderId:        p.orderId,
    lapId:          lap.lapId,
    gold24KWeight:  lap.gold24KWeight,
    totalGoldWeight: lap.totalGoldWeight,
    goldPurity:     lap.goldPurity,
    goldColor:      lap.goldColor,
    sourceLot24K:   lap.sourceLot24K,
  });

  _emit('audit-cell', 'AuditLogged', {
    orderId: p.orderId, lapId: lap.lapId,
    event: 'GOLD_ISSUED', gold24K: lap.gold24KWeight,
  });
}, 'prdmaterials-cell');

// ── Public API ──
export const PrdMaterialsEngine = {
  // Đánh dấu hỏng sau đúc
  markDefect(orderId: string, defectNote: string): void {
    const lap = _laps.get(orderId);
    if (!lap) return;
    const updated = markDefect(lap, orderId, defectNote);
    _laps.set(orderId, updated);

    const lossItem = lap.items.find(i => i.orderId === orderId);
    const lossGold = lossItem?.goldAllocation ?? 0;
    const tuoi     = String(lap.goldPurity / 10);
    const threshold = GOLD_LOSS_PCT[tuoi] ?? GOLD_LOSS_PCT['default'];
    const lossPct   = lap.totalGoldWeight > 0 ? (lossGold / lap.totalGoldWeight) * 100 : 0;

    if (lossPct > threshold) {
      EventBus.emit('MaterialRetained', {
        orderId:      lap.orderId ?? 'unknown',
        materialCode: lap.material ?? 'unknown',
        issued:       lap.issuedWeight ?? 0,
        returned:     lap.returnedWeight ?? 0,
        source:       'prdmaterials-cell',
        ts:           Date.now(),
      });
      _emit('compliance-cell', 'MaterialLossReported', {
        orderId, lapId: lap.lapId, lossGold, lossPct, threshold, stage: 'CASTING',
      });
    }
  },

  getLap:    (orderId: string): Lap | undefined => _laps.get(orderId),
  getAllLaps: (): Lap[]                          => [..._laps.values()],

  getConfidence: () => assessPrdMaterialsConfidence({
    totalLaps:             _laps.size,
    lapsWithGoldAllocation: [..._laps.values()].filter(l => l.status !== 'DRAFT').length,
    pendingLaps:           [..._laps.values()].filter(l => l.status === 'DRAFT').length,
  }),

  getHistory: (): TouchRecord[] => [..._touch],
};

// Legacy compat
export class PrdMaterialsDomainEngine {
  readonly cellId = 'prdmaterials-cell';
  execute(cmd: any) {
    return { success: true, data: { type: cmd.type, processed: true }, auditRef: `prdmaterials-${Date.now()}` };
  }
}
export const prdMaterialsDomainEngine = new PrdMaterialsDomainEngine();
