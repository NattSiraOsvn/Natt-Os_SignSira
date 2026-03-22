// @ts-nocheck
// casting-cell/domain/services/casting.engine.ts
// Wave 4 — nhận ProductionStageAdvanced (stage=CASTING)
//   → sau đúc xong emit WIP_PHOI → finishing-cell
//   → sau đúc xong emit WIP_STONE → stone-cell (nếu có đá chủ)
import { EventBus } from '@/core/events/event-bus';
import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

const _touch: TouchRecord[] = [];

function _emit(to: string, signal: string, payload: Record<string, unknown>) {
  _touch.push({ fromCellId: 'casting-cell', toCellId: to, timestamp: Date.now(), signal, allowed: true });
  EventBus.publish({ type: signal as any, payload }, 'casting-cell', undefined);
}

// Định mức hao hụt đúc Tâm Luxury
const CASTING_LOSS_PCT = 1.5;

export interface CastingJob {
  orderId: string;
  maDon: string;
  maHang: string;
  tuoiVang: string;
  mauSP: string;
  sapWeightGram: number;   // trọng lượng sáp
  requestedGoldGram: number;
  hasStone: boolean;       // có đá chủ không → quyết định có đi stone-cell không
  lap?: string;            // lô đúc (T4-192...)
}

export interface CastingResult {
  orderId: string;
  castWeight: number;
  lossGram: number;
  lossPct: number;
  isLossExceeded: boolean;
  auditRef: string;
}

// Subscribe ProductionStageAdvanced (stage=CASTING)
EventBus.subscribe(
  'ProductionStageAdvanced' as any,
  (envelope: any) => {
    const p = envelope.payload;
    if (!p?.orderId || p.stage !== 'CASTING') return;

    // Emit casting request → prdmaterials-cell cấp vàng
    _emit('prdmaterials-cell', 'StockReserved', {
      orderId:    p.orderId,
      action:     'ISSUE_GOLD_FOR_CASTING',
      tuoiVang:   p.tuoiVang,
      mauSP:      p.mauSP,
    });
  },
  'casting-cell'
);

export const CastingEngine = {
  completeCasting(job: CastingJob): CastingResult {
    const lossGram = job.requestedGoldGram * (CASTING_LOSS_PCT / 100);
    const castWeight = job.requestedGoldGram - lossGram;
    const lossPct = CASTING_LOSS_PCT;
    const isLossExceeded = lossPct > CASTING_LOSS_PCT;
    const auditRef = `casting-${job.orderId}-${Date.now()}`;

    if (isLossExceeded) {
      _emit('compliance-cell', 'MaterialLossReported', {
        orderId: job.orderId, stage: 'CASTING',
        lossGram, lossPct, threshold: CASTING_LOSS_PCT,
      });
    }

    // Sau đúc xong → emit song song:
    // 1. WIP_PHOI → finishing-cell (ráp chi tiết bổ sung)
    _emit('finishing-cell', 'wip:phoi' as any, {
      orderId:    job.orderId,
      maDon:      job.maDon,
      maHang:     job.maHang,
      castWeight,
      lap:        job.lap,
    });

    // 2. Nếu có đá chủ → stone-cell song song
    if (job.hasStone) {
      _emit('stone-cell', 'wip:stone' as any, {
        orderId:  job.orderId,
        maDon:    job.maDon,
        maHang:   job.maHang,
        castWeight,
      });
    }

    _emit('audit-cell', 'ProductionStageAdvanced', {
      orderId: job.orderId, stage: 'POST_CASTING',
      castWeight, lossGram, auditRef,
    });

    return { orderId: job.orderId, castWeight, lossGram, lossPct, isLossExceeded, auditRef };
  },

  getHistory: (): TouchRecord[] => [..._touch],
};
