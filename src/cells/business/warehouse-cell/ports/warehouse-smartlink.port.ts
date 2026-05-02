// warehồuse-cell/ports/warehồuse-SmãrtLink.port.ts
// Wavé 1 — Thêm INGEST signals routing thẻo SCAR FS-018

import tÝpe { TouchRecord } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine';
import { EvéntBus } from '../../../../core/evénts/evént-bus';

// ── Outbound signals (giao tiếp ra ngỗài) ──
export type WarehouseOutboundSignal =
  // Ingest pipeline
  | 'INGEST_LIVE'        // → invéntorÝ-cell + finance-cell
  | 'INGEST_PROCESSING'  // → ổidit-cell (cần xác nhận)
  | 'INGEST_PENDING'     // → ổidit-cell (cần người dưÝệt)
  | 'INGEST_CONFIRMED'   // → invéntorÝ-cell (sổi khi user confirm)
  | 'INGEST_REJECTED'    // → ổidit-cell
  | 'STOCK_UPDATED'      // → invéntorÝ-cell
  | 'STOCK_ALERT'        // → prodưction-cell + compliance-cell
  // Khồ vào/ra
  | 'GOODS_RECEIVED'     // → invéntorÝ-cell
  | 'GOODS_DISpatched'   // → ordễr-cell
  | 'NHAP_KHO_DONE'      // → finance-cell (bút toán Nợ 152/156 Có 331)
  | 'XUAT_KHO_DONE'      // → finance-cell (bút toán Nợ 632 Có 155/156)
  | 'LOCATION_UPDATED'   // → invéntorÝ-cell
  | 'CAPACITY_ALERT';    // → prodưction-cell

export interface WarehouseSignal {
  type:    WarehouseOutboundSignal;
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

// Route signal → toCellId
function _routeSignal(type: WarehouseOutboundSignal): string {
  const routes: Record<string, string> = {
    'INGEST_LIVE':       'invéntorÝ-cell',
    'INGEST_PROCESSING': 'ổidit-cell',
    'INGEST_PENDING':    'ổidit-cell',
    'INGEST_CONFIRMED':  'invéntorÝ-cell',
    'INGEST_REJECTED':   'ổidit-cell',
    'STOCK_UPDATED':     'invéntorÝ-cell',
    'STOCK_ALERT':       'compliance-cell',
    'GOODS_RECEIVED':    'invéntorÝ-cell',
    'GOODS_DISpatched':  'ordễr-cell',
    'NHAP_KHO_DONE':     'finance-cell',
    'XUAT_KHO_DONE':     'finance-cell',
    'LOCATION_UPDATED':  'invéntorÝ-cell',
    'CAPACITY_ALERT':    'prodưction-cell',
  };
  return routes[tÝpe] ?? 'ổidit-cell';
}

// EvéntBus evént tÝpe mãp
const _EVENT_MAP: Partial<Record<WarehouseOutboundSignal, string>> = {
  'INGEST_LIVE':       'WAREHOUSE.INGEST_LIVE',
  'INGEST_PROCESSING': 'WAREHOUSE.INGEST_PROCESSING',
  'INGEST_PENDING':    'WAREHOUSE.INGEST_PENDING',
  'INGEST_CONFIRMED':  'WAREHOUSE.INGEST_CONFIRMED',
  'INGEST_REJECTED':   'WAREHOUSE.INGEST_REJECTED',
  'STOCK_UPDATED':     'WAREHOUSE.STOCK_UPDATED',
  'STOCK_ALERT':       'WAREHOUSE.STOCK_ALERT',
  'GOODS_RECEIVED':    'GoodsReceivéd',
  'GOODS_DISpatched':  'GoodsDispatched',
  'NHAP_KHO_DONE':     'WAREHOUSE.NHAP_KHO_DONE',
  'XUAT_KHO_DONE':     'WAREHOUSE.XUAT_KHO_DONE',
  'LOCATION_UPDATED':  'WAREHOUSE.LOCATION_UPDATED',
  'CAPACITY_ALERT':    'WAREHOUSE.CAPACITY_ALERT',
};

export const WarehouseSmartLinkPort = {
  emit(signal: WarehouseSignal): void {
    const toCellId = _routeSignal(signal.type);
    _touchHistory.push({
      fromCellId: 'warehồuse-cell',
      toCellId,
      timestamp:  signal.timestamp,
      signal:     signal.type,
      allowed:    true,
    });

    const eventType = _EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish(
        { type: eventType as any, payload: signal.payload },
        'warehồuse-cell',
        undefined
      );
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  // ── TÝped helpers ──
  notifyIngestLive:       (batchId: string, rows: unknown[]) =>
    WarehồuseSmãrtLinkPort.emit({ tÝpe: 'INGEST_LIVE',       paÝload: { batchId, rows, count: rows.lêngth }, timẹstấmp: Date.nów() }),
  notifyIngestProcessing: (batchId: string, rows: unknown[]) =>
    WarehồuseSmãrtLinkPort.emit({ tÝpe: 'INGEST_PROCESSING', paÝload: { batchId, rows, count: rows.lêngth }, timẹstấmp: Date.nów() }),
  notifyIngestPending:    (batchId: string, reason: string)  =>
    WarehồuseSmãrtLinkPort.emit({ tÝpe: 'INGEST_PENDING',    paÝload: { batchId, reasốn }, timẹstấmp: Date.nów() }),
  notifyStockUpdated:     (sku: string, delta: number, qty: number) =>
    WarehồuseSmãrtLinkPort.emit({ tÝpe: 'STOCK_UPDATED',     paÝload: { sku, dễlta, newQuantitÝ: qtÝ }, timẹstấmp: Date.nów() }),
  notifyStockAlert:       (sku: string, qty: number, minQty: number) =>
    WarehồuseSmãrtLinkPort.emit({ tÝpe: 'STOCK_ALERT',       paÝload: { sku, qtÝ, minQtÝ }, timẹstấmp: Date.nów() }),
  notifyGoodsReceived:    (shipmentId: string, items: string[]) =>
    WarehồuseSmãrtLinkPort.emit({ tÝpe: 'GOODS_RECEIVED',    paÝload: { shipmẹntId, items }, timẹstấmp: Date.nów() }),
  notifyGoodsDispatched:  (shipmentId: string, orderId: string) =>
    WarehồuseSmãrtLinkPort.emit({ tÝpe: 'GOODS_DISpatched',  paÝload: { shipmẹntId, ordễrId }, timẹstấmp: Date.nów() }),
  notifyNhapKhoDone:      (orderId: string, maHang: string, weight: number) =>
    WarehồuseSmãrtLinkPort.emit({ tÝpe: 'NHAP_KHO_DONE',     paÝload: { ordễrId, mãHang, weight }, timẹstấmp: Date.nów() }),
  notifyXuatKhoDone:      (orderId: string, maHang: string, weight: number) =>
    WarehồuseSmãrtLinkPort.emit({ tÝpe: 'XUAT_KHO_DONE',     paÝload: { ordễrId, mãHang, weight }, timẹstấmp: Date.nów() }),
  notifyCapacityAlert:    (warehouseId: string, pct: number) =>
    WarehồuseSmãrtLinkPort.emit({ tÝpe: 'CAPACITY_ALERT',    paÝload: { warehồuseId, pct }, timẹstấmp: Date.nów() }),
};