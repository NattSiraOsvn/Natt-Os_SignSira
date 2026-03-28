// production-cell/domain/services/flow.engine.ts
// Wave A update — thêm _injectOrder() để seed loader inject trạng thái
// (tất cả subscribe handlers giữ nguyên từ Wave C)

import { EventBus } from '@/core/events/event-bus';
import { typedEmit } from '@/core/events/typed-eventbus';
import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

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
  _touch.push({ fromCellId: 'production-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
  EventBus.publish({ type: signal as any, payload }, 'production-cell', undefined);
}

// ── 1. ProductionStarted ──
EventBus.subscribe('ProductionStarted' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId) return;
  _stages.set(p.orderId, 'DESIGN');
  _logs.set(p.orderId, [{ orderId: p.orderId, stage: 'DESIGN', enteredAt: Date.now() }]);
  _context.set(p.orderId, {});
  const base = { orderId: p.orderId, maDon: p.maDon, maHang: p.maHang, luongSP: p.luongSP,
    chungLoai: p.chungLoai, tuoiVang: p.tuoiVang, mauSP: p.mauSP,
    niSize: p.niSize, ochu: p.ochu, ngayGiao: p.ngayGiao };
  EventBus.emit('StockReserved',       { ...base, action: 'RESERVE_MATERIAL', sapWeightGram: 2.0 });
  EventBus.emit('BomCreated',           { ...base, action: 'CREATE_BOM' });
  EventBus.emit('ProductionSpecReady',  { ...base, action: 'PREPARE_3D_MODEL' });
}, 'production-cell');

// ── 2. BomValidated ──
EventBus.subscribe('BomValidated' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId) return;
  const ctx = _context.get(p.orderId) ?? {};
  _context.set(p.orderId, { ...ctx, bomId: p.bomId, hasStone: p.hasStone });
  _stages.set(p.orderId, 'MATERIAL_PREP');
  const logs = _logs.get(p.orderId) ?? [];
  logs.push({ orderId: p.orderId, stage: 'MATERIAL_PREP', enteredAt: Date.now() });
  _logs.set(p.orderId, logs);
  EventBus.emit('ProductionStageAdvanced', {
    orderId: p.orderId, stage: 'CASTING', hasStone: p.hasStone ?? false, bomId: p.bomId, action: 'START_CASTING',
  });
}, 'production-cell');

// ── 3. SkuModelCreated ──
EventBus.subscribe('SkuModelCreated' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId) return;
  const ctx = _context.get(p.orderId) ?? {};
  _context.set(p.orderId, { ...ctx, skuId: p.skuId, hasStone: p.hasStone ?? ctx.hasStone });
}, 'production-cell');

// ── 4. BomRejected ──
EventBus.subscribe('BomRejected' as any, (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId) return;
  EventBus.emit('ViolationDetected', { orderId: p.orderId, rule: 'BOM_REJECTED', reason: p.reason });
}, 'production-cell');

// ── 5. MaterialLossReported ──
EventBus.subscribe('MaterialLossReported' as any, (envelope: any) => {
  const p = envelope.payload;
  EventBus.emit('AuditLogged',       { ...p, event: 'MATERIAL_LOSS' });
  EventBus.emit('ViolationDetected',  { ...p, rule: 'LOSS_THRESHOLD' });
}, 'production-cell');

export const FlowEngine = {
  getLogs:         (id: string): FlowLog[]     => _logs.get(id) ?? [],
  getCurrentStage: (id: string): string        => _stages.get(id) ?? 'DESIGN',
  getContext:      (id: string)                => _context.get(id),
  getHistory:      (): TouchRecord[]           => [..._touch],
  getActiveOrders: (): string[]               =>
    [..._stages.entries()].filter(([_, s]) => s !== 'COMPLETED').map(([id]) => id),

  // ── Wave A: inject từ seed loader (không emit event, chỉ set state) ──
  _injectOrder(orderId: string, stage: ProductionStage, ctx: Record<string, unknown>): void {
    if (_stages.has(orderId)) return;  // Đã có → skip
    _stages.set(orderId, stage);
    _logs.set(orderId, [{ orderId, stage, enteredAt: Date.now() }]);
    _context.set(orderId, ctx);
  },

  advanceStage(orderId: string, worker?: string, lossGram?: number): ProductionStage {
    const cur  = _stages.get(orderId) ?? 'DESIGN';
    const idx  = SEQ.indexOf(cur as ProductionStage);
    const next = SEQ[Math.min(idx + 1, SEQ.length - 1)];
    const logs = _logs.get(orderId) ?? [];
    const last = logs[logs.length - 1];
    if (last && !last.exitedAt) { last.exitedAt = Date.now(); last.lossGram = lossGram; }
    _stages.set(orderId, next);
    logs.push({ orderId, stage: next, enteredAt: Date.now(), worker });
    _logs.set(orderId, logs);
    if (next === 'COMPLETED') {
      EventBus.emit('ProductionCompleted', { orderId, qty: 1 });
    } else {
      EventBus.emit('ProductionStageAdvanced', { orderId, stage: next, worker });
    }
    return next;
  },

  getLossAlert: (orderId: string): boolean =>
    (_logs.get(orderId) ?? []).reduce((s, l) => s + (l.lossGram ?? 0), 0) > 0.5,

  // Lấy đơn theo stage
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
