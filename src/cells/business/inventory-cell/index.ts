// @ts-nocheck — TODO: fix type errors, remove this pragma

// inventory-cell/index.ts — Wave 4 wire: diamond-normalize + EventBus
export { InventoryEngine } from './infrastructure/Inventory.engine';
export { ProcessWipCompletedUseCase } from './application/inventory.usecase';
export type { IInventoryRepository } from './application/inventory.usecase';
export type { StockEntry, StockEntryStatus } from './domain/inventory.entity';
export { createStockEntry } from './domain/inventory.entity';
export { InventorySheetAdapterStub } from './interface/inventory.sheets.adapter';
export * from './ports/inventory-smartlink.port';

// Wave 4 engines
export {
  diamondNormalizeV2,
  tachMaVien,
  tinhHoaHong,
  RAPAPORT_TIER,
  COLOR_GRADES,
  CLARITY_GRADES,
} from './domain/engines/diamond-normalize.engine';
export type {
  DiamondRecord,
} from './domain/engines/diamond-normalize.engine';

// Wire: diamond normalize → EventBus
import { EventBus } from '../../../core/events/event-bus';
import { diamondNormalizeV2 } from './domain/engines/diamond-normalize.engine';
import { tachMaVien } from './domain/engines/diamond-normalize.engine';

const certSeen = new Set<string>();

EventBus.subscribe('INVENTORY_ITEM_RECEIVED', (event: unknown) => {
  const ev = event as { payload?: { rawText?: string; itemId?: string } };
  if (!ev?.payload?.rawText) return;

  const { rawText, itemId } = ev.payload;
  const record = diamondNormalizeV2(rawText, certSeen);

  if (record.certNumber) certSeen.add(record.certNumber);
  if (record.isDuplicate) {
    EventBus.publish({
      type: 'INVENTORY_DUPLICATE_DETECTED',
      source: 'inventory-cell',
      payload: { itemId, certNumber: record.certNumber, skuAuto: record.skuAuto },
    }, 'inventory-cell', undefined);
    return;
  }

  if (record.confidence >= 0.6) {
    EventBus.publish({
      type: 'INVENTORY_DIAMOND_CLASSIFIED',
      source: 'inventory-cell',
      payload: { itemId, record, confidence: record.confidence },
    }, 'inventory-cell', undefined);
  } else {
    EventBus.publish({
      type: 'INVENTORY_NEEDS_REVIEW',
      source: 'inventory-cell',
      payload: { itemId, errors: record.errors, confidence: record.confidence },
    }, 'inventory-cell', undefined);
  }
});

EventBus.subscribe('INVENTORY_CODE_NORMALIZE', (event: unknown) => {
  const ev = event as { payload?: { rawCode?: string } };
  if (!ev?.payload?.rawCode) return;
  const { maSP, maVien } = tachMaVien(ev.payload.rawCode);
  EventBus.publish({
    type: 'INVENTORY_CODE_NORMALIZED',
    source: 'inventory-cell',
    payload: { maSP, maVien },
  }, 'inventory-cell', undefined);
});
