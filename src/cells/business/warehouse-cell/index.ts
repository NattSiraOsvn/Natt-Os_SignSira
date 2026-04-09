// @ts-nocheck — TODO: fix type errors, remove this pragma

// warehouse-cell/index.ts
// Wave 1 — Ingest pipeline hoàn tất
//
// EventBus subscriptions:
//   ProductionCompleted  ← flow.engine (thành phẩm xong → nhập kho)
//   GoodsDispatched      ← order-cell / sales-cell (giao hàng → xuất kho)
//   GoodsReceived        ← external (nhập NL từ NCC)
//
// Ingest pipeline:
//   warehouseIngestHandler.process(batch)
//     → INGEST_LIVE      → WarehouseSmartLinkPort → inventory-cell + finance-cell
//     → INGEST_PROCESSING → audit-cell (chờ xác nhận)
//     → INGEST_PENDING   → audit-cell (chờ người duyệt)
//     → STOCK_UPDATED    → inventory-cell
//     → NHAP/XUAT_KHO_DONE → finance-cell

export * from './domain/entities';
export * from './domain/services';

import { EventBus }                      from '../../../core/events/event-bus';
import { createWarehouseIngestHandler }  from './domain/services/warehouse-ingest.handler';
import { WarehouseSmartLinkPort }        from './ports/warehouse-smartlink.port';
import { WAREHOUSE_EVENTS }              from './domain/services/warehouse.events';

// ── In-memory stock registry (tồn kho đơn giản) ──
const _stock = new Map<string, { qty: number; weight: number; unit: string }>();

function _updateStock(sku: string, delta: number, unit: string) {
  const cur = _stock.get(sku) ?? { qty: 0, weight: 0, unit };
  const updated = { ...cur, qty: cur.qty + delta, unit };
  _stock.set(sku, updated);

  WarehouseSmartLinkPort.notifyStockUpdated(sku, delta, updated.qty);

  // Cảnh báo nếu xuống dưới ngưỡng tối thiểu
  const minQty = 2;
  if (updated.qty < minQty && updated.qty >= 0) {
    WarehouseSmartLinkPort.notifyStockAlert(sku, updated.qty, minQty);
  }
}

// ── Wire ingest handler với EventBus ──
export const warehouseIngestHandler = createWarehouseIngestHandler(
  (ev) => EventBus.publish(ev, 'warehouse-cell', undefined)
);

// ── Subscribe: ProductionCompleted → NHẬP KHO thành phẩm ──
EventBus.subscribe('ProductionCompleted' as any, async (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId) return;

  const batchId = `NHAP-${p.orderId}-${Date.now()}`;
  const maHang  = p.maHang ?? p.orderId;

  const report = await warehouseIngestHandler.process({
    batchId,
    rows: [{
      'mã đơn':     p.orderId,
      'mã hàng':    maHang,
      'loại':       'nhập kho thành phẩm',
      'số lượng':   p.qty ?? 1,
      'trọng lượng': p.goldWeightGram ?? 0,
      'đơn vị':     'cái',
      'ngày':       new Date().toISOString().split('T')[0],
    }],
    sourceFile:  'production-flow',
    sourceSheet: 'ProductionCompleted',
    requestedBy: 'production-cell',
  });

  // Nếu LIVE → nhập kho thực sự
  if (report.liveCount > 0) {
    _updateStock(maHang, p.qty ?? 1, 'cái');
    WarehouseSmartLinkPort.notifyNhapKhoDone(p.orderId, maHang, p.goldWeightGram ?? 0);
    WarehouseSmartLinkPort.notifyGoodsReceived(batchId, [maHang]);
  }
}, 'warehouse-cell');

// ── Subscribe: GoodsDispatched → XUẤT KHO giao hàng ──
EventBus.subscribe('GoodsDispatched' as any, async (envelope: any) => {
  const p = envelope.payload;
  if (!p?.orderId && !p?.shipmentId) return;

  const batchId = `XUAT-${p.orderId ?? p.shipmentId}-${Date.now()}`;
  const maHang  = p.maHang ?? p.itemId ?? p.orderId;

  const report = await warehouseIngestHandler.process({
    batchId,
    rows: [{
      'mã đơn':   p.orderId ?? p.shipmentId,
      'mã hàng':  maHang,
      'loại':     'xuất kho giao hàng',
      'số lượng': p.qty ?? 1,
      'đơn vị':   'cái',
      'ngày':     new Date().toISOString().split('T')[0],
    }],
    sourceFile:  'order-flow',
    sourceSheet: 'GoodsDispatched',
    requestedBy: 'order-cell',
  });

  if (report.liveCount > 0) {
    _updateStock(maHang, -(p.qty ?? 1), 'cái');
    WarehouseSmartLinkPort.notifyXuatKhoDone(p.orderId, maHang, 0);
    WarehouseSmartLinkPort.notifyGoodsDispatched(batchId, p.orderId ?? '');
  }
}, 'warehouse-cell');

// ── Subscribe: GoodsReceived (nhập NL từ nhà cung cấp) ──
EventBus.subscribe('GoodsReceived' as any, async (envelope: any) => {
  const p = envelope.payload;
  // Chỉ xử lý từ supplier (không phải từ production)
  if (!p?.shipmentId || p.source === 'production-cell') return;

  const batchId = `NL-${p.shipmentId}-${Date.now()}`;
  const items   = Array.isArray(p.items) ? p.items : [p.shipmentId];

  const rows = items.map((item: string) => ({
    'mã hàng':    item,
    'loại':       'nhập nguyên liệu',
    'số lượng':   1,
    'ngày':       new Date().toISOString().split('T')[0],
  }));

  await warehouseIngestHandler.process({ batchId, rows, requestedBy: 'supplier' });

  // Notify inventory-cell → diamond normalize + code normalize
  items.forEach((item: string) => {
    EventBus.emit('INVENTORY_ITEM_RECEIVED', { itemId: item, rawText: item, source: 'warehouse-cell', ts: Date.now() });
    EventBus.emit('INVENTORY_CODE_NORMALIZE', { rawCode: item, source: 'warehouse-cell', ts: Date.now() });
  });
}, 'warehouse-cell');

// ── Public API ──
export const WarehouseStore = {
  getStock:    (sku: string) => _stock.get(sku),
  getAllStock:  ()            => Object.fromEntries(_stock),
  getTotalSkus: ()           => _stock.size,

  // Manual ingest — dùng khi UI paste dữ liệu thủ công
  async ingest(rows: Record<string, unknown>[], sourceFile?: string) {
    const batchId = `MANUAL-${Date.now()}`;
    return warehouseIngestHandler.process({ batchId, rows, sourceFile, requestedBy: 'manual' });
  },

  confirmRow:  (...args: Parameters<typeof warehouseIngestHandler.confirmRow>) =>
    warehouseIngestHandler.confirmRow(...args),
  rejectRow:   (...args: Parameters<typeof warehouseIngestHandler.rejectRow>) =>
    warehouseIngestHandler.rejectRow(...args),
};
