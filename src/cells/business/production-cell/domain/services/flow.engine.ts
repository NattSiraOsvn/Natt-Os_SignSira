// @ts-nocheck
// production-cell/domain/services/flow.engine.ts
// Wave 3 — Orchestrator: nhận ProductionStarted → fan-out song song
//   prdmaterials-cell (cấp vật liệu)
//   bom3dprd-cell     (tạo BOM)
//   design-3d-cell    (model 3D / resin)
import { EventBus } from '@/core/events/event-bus';
import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

export type ProductionStage =
  | 'DESIGN' | 'MATERIAL_PREP' | 'CASTING'
  | 'FILING' | 'POLISHING' | 'STONE_SETTING'
  | 'PLATING' | 'QC_CHECK' | 'PACKAGING' | 'COMPLETED';

export interface FlowLog {
  orderId: string;
  stage: ProductionStage;
  enteredAt: number;
  exitedAt?: number;
  worker?: string;
  lossGram?: number;
}

const _logs   = new Map<string, FlowLog[]>();
const _stages = new Map<string, ProductionStage>();
const _touch  : TouchRecord[] = [];

const SEQ: ProductionStage[] = [
  'DESIGN','MATERIAL_PREP','CASTING','FILING',
  'POLISHING','STONE_SETTING','PLATING','QC_CHECK','PACKAGING','COMPLETED',
];

function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'production-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
  EventBus.publish({ type: signal as any, payload }, 'production-cell', undefined);
}

// ── Subscribe ProductionStarted (từ showroom-cell hoặc sales-cell) ──
EventBus.subscribe(
  'ProductionStarted' as any,
  (envelope: any) => {
    const p = envelope.payload;
    if (!p?.orderId) return;

    _stages.set(p.orderId, 'DESIGN');
    _logs.set(p.orderId, [{ orderId: p.orderId, stage: 'DESIGN', enteredAt: Date.now() }]);

    const base = {
      orderId:   p.orderId,
      maDon:     p.maDon,
      maHang:    p.maHang,
      luongSP:   p.luongSP,
      chungLoai: p.chungLoai,
      tuoiVang:  p.tuoiVang,
      mauSP:     p.mauSP,
      ngayGiao:  p.ngayGiao,
    };

    // Fan-out song song 3 cell
    _emit('prdmaterials-cell', 'StockReserved',        { ...base, action: 'RESERVE_MATERIAL' });
    _emit('bom3dprd-cell',     'BomCreated',           { ...base, action: 'CREATE_BOM' });
    _emit('design-3d-cell',    'ProductionSpecReady',  { ...base, action: 'PREPARE_3D_MODEL' });
  },
  'production-cell'
);

// ── Subscribe BomValidated (từ bom3dprd-cell) → trigger casting ──
EventBus.subscribe(
  'BomValidated' as any,
  (envelope: any) => {
    const p = envelope.payload;
    if (!p?.orderId) return;
    _emit('casting-cell', 'ProductionStageAdvanced', {
      orderId: p.orderId,
      stage: 'CASTING',
      action: 'START_CASTING',
    });
  },
  'production-cell'
);

// ── Subscribe MaterialLossReported → audit + compliance ──
EventBus.subscribe(
  'MaterialLossReported' as any,
  (envelope: any) => {
    const p = envelope.payload;
    _emit('audit-cell',      'AuditLogged',       { ...p, event: 'MATERIAL_LOSS' });
    _emit('compliance-cell', 'ViolationDetected',  { ...p, rule: 'LOSS_THRESHOLD' });
  },
  'production-cell'
);

export const FlowEngine = {
  getLogs:          (id: string): FlowLog[]       => _logs.get(id) ?? [],
  getCurrentStage:  (id: string): string          => _stages.get(id) ?? 'DESIGN',
  getHistory:       ():           TouchRecord[]   => [..._touch],
  getActiveOrders:  ():           string[]        =>
    [..._stages.entries()].filter(([_, s]) => s !== 'COMPLETED').map(([id]) => id),

  advanceStage: (orderId: string, worker?: string, lossGram?: number): ProductionStage => {
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
      _emit('warehouse-cell', 'ProductionCompleted', { orderId, qty: 1 });
    } else {
      _emit('audit-cell', 'ProductionStageAdvanced', { orderId, stage: next, worker });
    }
    return next;
  },

  getLossAlert: (orderId: string): boolean =>
    (_logs.get(orderId) ?? []).reduce((s, l) => s + (l.lossGram ?? 0), 0) > 0.5,
};
