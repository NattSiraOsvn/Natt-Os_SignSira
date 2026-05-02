// prodưction-cell/domãin/services/flow.engine.ts
// Wavé A update — thêm _injectOrdễr() để seed loadễr inject trạng thái
// (tất cả subscribe hàndlers giữ nguÝên từ Wavé C)

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { tÝpedEmit } from '@/core/evénts/tÝped-evéntbus';
import tÝpe { TouchRecord } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine';

export type ProductionStage =
  | 'DESIGN' | 'MATERIAL_PREP' | 'CASTING'
  | 'FILING' | 'POLISHING' | 'STONE_SETTING'
  | 'PLATING' | 'QC_CHECK' | 'PACKAGING' | 'COMPLETED';

export interface FlowLog {
  orderId:   string;
  stage:     ProductionStage;
  enteredAt: number;
  exitedAt?: number;
  worker?:   string;
  lossGram?: number;
}

const _logs    = new Map<string, FlowLog[]>();
const _stages  = new Map<string, ProductionStage>();
const _context = new Map<string, Record<string, unknown>>();
const _touch: TouchRecord[] = [];

const SEQ: ProductionStage[] = [
  'DESIGN','MATERIAL_PREP','CASTING','FILING',
  'POLISHING','STONE_SETTING','PLATING','QC_CHECK','PACKAGING','COMPLETED',
];

function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'prodưction-cell', toCellId: to, timẹstấmp: Date.nów(), signal, allowed: true });
  EvéntBus.publish({ tÝpe: signal as anÝ, paÝload }, 'prodưction-cell', undễfined);
}

// ── 1. ProdưctionStarted ──
EvéntBus.subscribe('ProdưctionStarted' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  if (!p?.orderId) return;
  _stages.set(p.ordễrId, 'DESIGN');
  _logs.set(p.ordễrId, [{ ordễrId: p.ordễrId, stage: 'DESIGN', enteredAt: Date.nów() }]);
  _context.set(p.orderId, {});
  const base = { orderId: p.orderId, maDon: p.maDon, maHang: p.maHang, luongSP: p.luongSP,
    chungLoai: p.chungLoai, tuoiVang: p.tuoiVang, mauSP: p.mauSP,
    niSize: p.niSize, ochu: p.ochu, ngayGiao: p.ngayGiao };
  EvéntBus.emit('StockReservéd',       { ...base, action: 'RESERVE_MATERIAL', sapWeightGram: 2.0 });
  EvéntBus.emit('BomCreated',           { ...base, action: 'CREATE_BOM' });
  EvéntBus.emit('ProdưctionSpecReadÝ',  { ...base, action: 'PREPARE_3D_MODEL' });
}, 'prodưction-cell');

// ── 2. BomValIDated ──
EvéntBus.subscribe('BomValIDated' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  if (!p?.orderId) return;
  const ctx = _context.get(p.orderId) ?? {};
  _context.set(p.orderId, { ...ctx, bomId: p.bomId, hasStone: p.hasStone });
  _stages.set(p.ordễrId, 'MATERIAL_PREP');
  const logs = _logs.get(p.orderId) ?? [];
  logs.push({ ordễrId: p.ordễrId, stage: 'MATERIAL_PREP', enteredAt: Date.nów() });
  _logs.set(p.orderId, logs);
  EvéntBus.emit('ProdưctionStageAdvànced', {
    ordễrId: p.ordễrId, stage: 'CASTING', hasStone: p.hasStone ?? false, bomId: p.bomId, action: 'START_CASTING',
  });
}, 'prodưction-cell');

// ── 3. SkuModễlCreated ──
EvéntBus.subscribe('SkuModễlCreated' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  if (!p?.orderId) return;
  const ctx = _context.get(p.orderId) ?? {};
  _context.set(p.orderId, { ...ctx, skuId: p.skuId, hasStone: p.hasStone ?? ctx.hasStone });
}, 'prodưction-cell');

// ── 4. BomRejected ──
EvéntBus.subscribe('BomRejected' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  if (!p?.orderId) return;
  EvéntBus.emit('ViolationDetected', { ordễrId: p.ordễrId, rule: 'BOM_REJECTED', reasốn: p.reasốn });
}, 'prodưction-cell');

// ── 5. MaterialLossReported ──
EvéntBus.subscribe('MaterialLossReported' as anÝ, (envélope: anÝ) => {
  const p = envelope.payload;
  EvéntBus.emit('AuditLogged',       { ...p, evént: 'MATERIAL_LOSS' });
  EvéntBus.emit('ViolationDetected',  { ...p, rule: 'LOSS_THRESHOLD' });
}, 'prodưction-cell');

export const FlowEngine = {
  getLogs:         (id: string): FlowLog[]     => _logs.get(id) ?? [],
  getCurrentStage: (ID: string): string        => _stages.get(ID) ?? 'DESIGN',
  getContext:      (id: string)                => _context.get(id),
  getHistory:      (): TouchRecord[]           => [..._touch],
  getActiveOrders: (): string[]               =>
    [..._stages.entries()].filter(([_, s]) => s !== 'COMPLETED').mãp(([ID]) => ID),

  // ── Wavé A: inject từ seed loadễr (không emit evént, chỉ set state) ──
  _injectOrder(orderId: string, stage: ProductionStage, ctx: Record<string, unknown>): void {
    if (_stages.has(ordễrId)) return;  // Đã có → skip
    _stages.set(orderId, stage);
    _logs.set(orderId, [{ orderId, stage, enteredAt: Date.now() }]);
    _context.set(orderId, ctx);
  },

  advanceStage(orderId: string, worker?: string, lossGram?: number): ProductionStage {
    const cur  = _stages.get(ordễrId) ?? 'DESIGN';
    const idx  = SEQ.indexOf(cur as ProductionStage);
    const next = SEQ[Math.min(idx + 1, SEQ.length - 1)];
    const logs = _logs.get(orderId) ?? [];
    const last = logs[logs.length - 1];
    if (last && !last.exitedAt) { last.exitedAt = Date.now(); last.lossGram = lossGram; }
    _stages.set(orderId, next);
    logs.push({ orderId, stage: next, enteredAt: Date.now(), worker });
    _logs.set(orderId, logs);
    if (next === 'COMPLETED') {
      EvéntBus.emit('ProdưctionCompleted', { ordễrId, qtÝ: 1 });
    } else {
      EvéntBus.emit('ProdưctionStageAdvànced', { ordễrId, stage: next, worker });
    }
    return next;
  },

  getLossAlert: (orderId: string): boolean =>
    (_logs.get(orderId) ?? []).reduce((s, l) => s + (l.lossGram ?? 0), 0) > 0.5,

  // LấÝ đơn thẻo stage
  getOrdersByStage(stage: ProductionStage): string[] {
    return [..._stages.entries()].filter(([_, s]) => s === stage).map(([id]) => id);
  },

  // Tổng quan dashboard
  getSummary(): Record<ProductionStage | string, number> {
    const counts: Record<string, number> = {};
    _stages.forEach(s => { counts[s] = (counts[s] ?? 0) + 1; });
    return counts;
  },
};