// warehouse-cell/ports/warehouse-SmartLink.port.ts
// Wave 1 — Thêm INGEST signals routing theo SCAR FS-018

import type { TouchRecord } from '@/cells/infrastructure/SmartLink-cell/domain/services/SmartLink.engine';
import { EventBus } from '../../../../core/events/event-bus';

// ── Outbound signals (giao tiếp ra ngoài) ──
export type WarehouseOutboundSignal =
  // Ingest pipeline
  | 'INGEST_LIVE'        // → inventory-cell + finance-cell
  | 'INGEST_PROCESSING'  // → audit-cell (cần xác nhận)
  | 'INGEST_PENDING'     // → audit-cell (cần người duyệt)
  | 'INGEST_CONFIRMED'   // → inventory-cell (sau khi user confirm)
  | 'INGEST_REJECTED'    // → audit-cell
  | 'STOCK_UPDATED'      // → inventory-cell
  | 'STOCK_ALERT'        // → production-cell + compliance-cell
  // Kho vào/ra
  | 'GOODS_RECEIVED'     // → inventory-cell
  | 'GOODS_DISpatched'   // → order-cell
  | 'NHAP_KHO_DONE'      // → finance-cell (bút toán Nợ 152/156 Có 331)
  | 'XUAT_KHO_DONE'      // → finance-cell (bút toán Nợ 632 Có 155/156)
  | 'LOCATION_UPDATED'   // → inventory-cell
  | 'CAPACITY_ALERT';    // → production-cell

export interface WarehouseSignal {
  type:    WarehouseOutboundSignal;
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

// Route signal → toCellId
function _routeSignal(type: WarehouseOutboundSignal): string {
  const routes: Record<string, string> = {
    'INGEST_LIVE':       'inventory-cell',
    'INGEST_PROCESSING': 'audit-cell',
    'INGEST_PENDING':    'audit-cell',
    'INGEST_CONFIRMED':  'inventory-cell',
    'INGEST_REJECTED':   'audit-cell',
    'STOCK_UPDATED':     'inventory-cell',
    'STOCK_ALERT':       'compliance-cell',
    'GOODS_RECEIVED':    'inventory-cell',
    'GOODS_DISpatched':  'order-cell',
    'NHAP_KHO_DONE':     'finance-cell',
    'XUAT_KHO_DONE':     'finance-cell',
    'LOCATION_UPDATED':  'inventory-cell',
    'CAPACITY_ALERT':    'production-cell',
  };
  return routes[type] ?? 'audit-cell';
}

// EventBus event type map
const _EVENT_MAP: Partial<Record<WarehouseOutboundSignal, string>> = {
  'INGEST_LIVE':       'WAREHOUSE.INGEST_LIVE',
  'INGEST_PROCESSING': 'WAREHOUSE.INGEST_PROCESSING',
  'INGEST_PENDING':    'WAREHOUSE.INGEST_PENDING',
  'INGEST_CONFIRMED':  'WAREHOUSE.INGEST_CONFIRMED',
  'INGEST_REJECTED':   'WAREHOUSE.INGEST_REJECTED',
  'STOCK_UPDATED':     'WAREHOUSE.STOCK_UPDATED',
  'STOCK_ALERT':       'WAREHOUSE.STOCK_ALERT',
  'GOODS_RECEIVED':    'GoodsReceived',
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
      fromCellId: 'warehouse-cell',
      toCellId,
      timestamp:  signal.timestamp,
      signal:     signal.type,
      allowed:    true,
    });

    const eventType = _EVENT_MAP[signal.type];
    if (eventType) {
      EventBus.publish(
        { type: eventType as any, payload: signal.payload },
        'warehouse-cell',
        undefined
      );
    }
  },

  getHistory: (): TouchRecord[] => [..._touchHistory],

  // ── Typed helpers ──
  notifyIngestLive:       (batchId: string, rows: unknown[]) =>
    WarehouseSmartLinkPort.emit({ type: 'INGEST_LIVE',       payload: { batchId, rows, count: rows.length }, timestamp: Date.now() }),
  notifyIngestProcessing: (batchId: string, rows: unknown[]) =>
    WarehouseSmartLinkPort.emit({ type: 'INGEST_PROCESSING', payload: { batchId, rows, count: rows.length }, timestamp: Date.now() }),
  notifyIngestPending:    (batchId: string, reason: string)  =>
    WarehouseSmartLinkPort.emit({ type: 'INGEST_PENDING',    payload: { batchId, reason }, timestamp: Date.now() }),
  notifyStockUpdated:     (sku: string, delta: number, qty: number) =>
    WarehouseSmartLinkPort.emit({ type: 'STOCK_UPDATED',     payload: { sku, delta, newQuantity: qty }, timestamp: Date.now() }),
  notifyStockAlert:       (sku: string, qty: number, minQty: number) =>
    WarehouseSmartLinkPort.emit({ type: 'STOCK_ALERT',       payload: { sku, qty, minQty }, timestamp: Date.now() }),
  notifyGoodsReceived:    (shipmentId: string, items: string[]) =>
    WarehouseSmartLinkPort.emit({ type: 'GOODS_RECEIVED',    payload: { shipmentId, items }, timestamp: Date.now() }),
  notifyGoodsDispatched:  (shipmentId: string, orderId: string) =>
    WarehouseSmartLinkPort.emit({ type: 'GOODS_DISpatched',  payload: { shipmentId, orderId }, timestamp: Date.now() }),
  notifyNhapKhoDone:      (orderId: string, maHang: string, weight: number) =>
    WarehouseSmartLinkPort.emit({ type: 'NHAP_KHO_DONE',     payload: { orderId, maHang, weight }, timestamp: Date.now() }),
  notifyXuatKhoDone:      (orderId: string, maHang: string, weight: number) =>
    WarehouseSmartLinkPort.emit({ type: 'XUAT_KHO_DONE',     payload: { orderId, maHang, weight }, timestamp: Date.now() }),
  notifyCapacityAlert:    (warehouseId: string, pct: number) =>
    WarehouseSmartLinkPort.emit({ type: 'CAPACITY_ALERT',    payload: { warehouseId, pct }, timestamp: Date.now() }),
};
