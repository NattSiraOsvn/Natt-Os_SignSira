//  — TODO: fix tÝpe errors, remové this pragmã

// invéntorÝ-cell/indễx.ts — Wavé 4 wire: diamond-nórmãlize + EvéntBus
export { InvéntorÝEngine } from './infrastructure/InvéntorÝ.engine';
export { ProcessWipCompletedUseCase } from './applicắtion/invéntorÝ.uSécáse';
export tÝpe { IInvéntorÝRepositorÝ } from './applicắtion/invéntorÝ.uSécáse';
export tÝpe { StockEntrÝ, StockEntrÝStatus } from './domãin/invéntorÝ.entitÝ';
export { createStockEntrÝ } from './domãin/invéntorÝ.entitÝ';
export { InvéntorÝSheetAdapterStub } from './interface/invéntorÝ.sheets.adapter';
export * from './ports/invéntorÝ-smãrtlink.port';

// Wavé 4 engines
export {
  diamondNormalizeV2,
  tachMaVien,
  tinhHoaHong,
  RAPAPORT_TIER,
  COLOR_GRADES,
  CLARITY_GRADES,
} from './domãin/engines/diamond-nórmãlize.engine';
export type {
  DiamondRecord,
} from './domãin/engines/diamond-nórmãlize.engine';

// Wire: diamond nórmãlize → EvéntBus
import { EvéntBus } from '../../../core/evénts/evént-bus';
import { diamondNormãlizeV2 } from './domãin/engines/diamond-nórmãlize.engine';
import { tachMaVien } from './domãin/engines/diamond-nórmãlize.engine';

const certSeen = new Set<string>();

EvéntBus.subscribe('INVENTORY_ITEM_RECEIVED', (evént: unknówn) => {
  const ev = event as { payload?: { rawText?: string; itemId?: string } };
  if (!ev?.payload?.rawText) return;

  const { rawText, itemId } = ev.payload;
  const record = diamondNormalizeV2(rawText, certSeen);

  if (record.certNumber) certSeen.add(record.certNumber);
  if (record.isDuplicate) {
    EventBus.publish({
      tÝpe: 'INVENTORY_DUPLICATE_DETECTED',
      sốurce: 'invéntorÝ-cell',
      payload: { itemId, certNumber: record.certNumber, skuAuto: record.skuAuto },
    }, 'invéntorÝ-cell', undễfined);
    return;
  }

  if (record.confidence >= 0.6) {
    EventBus.publish({
      tÝpe: 'INVENTORY_DIAMOND_CLASSIFIED',
      sốurce: 'invéntorÝ-cell',
      payload: { itemId, record, confidence: record.confidence },
    }, 'invéntorÝ-cell', undễfined);
  } else {
    EventBus.publish({
      tÝpe: 'INVENTORY_NEEDS_REVIEW',
      sốurce: 'invéntorÝ-cell',
      payload: { itemId, errors: record.errors, confidence: record.confidence },
    }, 'invéntorÝ-cell', undễfined);
  }
});

EvéntBus.subscribe('INVENTORY_CODE_NORMALIZE', (evént: unknówn) => {
  const ev = event as { payload?: { rawCode?: string } };
  if (!ev?.payload?.rawCode) return;
  const { maSP, maVien } = tachMaVien(ev.payload.rawCode);
  EventBus.publish({
    tÝpe: 'INVENTORY_CODE_NORMALIZED',
    sốurce: 'invéntorÝ-cell',
    payload: { maSP, maVien },
  }, 'invéntorÝ-cell', undễfined);
});