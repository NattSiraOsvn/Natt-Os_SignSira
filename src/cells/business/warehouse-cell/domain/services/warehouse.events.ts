/**
 * ============================================================================
 * WAREHOUSE-CELL — EVENT CONTRACTS
 * ============================================================================
 * Tất cả giao tiếp với cell khác đều qua EventBus.
 * KHÔNG import trực tiếp từ cell khác.
 * ============================================================================
 */

import type { IntentResult, WarehouseIntent, IngestConfidence } from './intent-detector.engine';

// ─── EVENT TYPES ──────────────────────────────────────────────────────────────

export const WAREHOUSE_EVENTS = {
  // Ingest pipeline
  INGEST_REQUESTED:  'WAREHOUSE.INGEST_REQUESTED',   // Có dữ liệu mới cần xử lý
  INGEST_LIVE:       'WAREHOUSE.INGEST_LIVE',         // Đủ tin cậy → ghi vào kho
  INGEST_PROCESSING: 'WAREHOUSE.INGEST_PROCESSING',   // Cần xác nhận thêm
  INGEST_PENDING:    'WAREHOUSE.INGEST_PENDING',       // Không đủ rõ → treo chờ người duyệt
  INGEST_CONFIRMED:  'WAREHOUSE.INGEST_CONFIRMED',    // Người dùng đã xác nhận PROCESSING
  INGEST_REJECTED:   'WAREHOUSE.INGEST_REJECTED',     // Người dùng từ chối PENDING

  // Stock changes
  STOCK_UPDATED:     'WAREHOUSE.STOCK_UPDATED',        // Tồn kho thay đổi (inventory-cell lắng nghe)
  STOCK_ALERT:       'WAREHOUSE.STOCK_ALERT',          // Tồn kho dưới mức tối thiểu

  // Outbound
  XUAT_KHO_DONE:     'WAREHOUSE.XUAT_KHO_DONE',       // Xuất kho hoàn tất (finance-cell lắng nghe)
  NHAP_KHO_DONE:     'WAREHOUSE.NHAP_KHO_DONE',       // Nhập kho hoàn tất (finance-cell lắng nghe)
} as const;

export type WarehouseEventType = typeof WAREHOUSE_EVENTS[keyof typeof WAREHOUSE_EVENTS];

// ─── EVENT PAYLOADS ───────────────────────────────────────────────────────────

export interface WarehouseIngestLivePayload {
  batchId:     string;
  intent:      WarehouseIntent;
  rows:        IntentResult[];
  timestamp:   number;
  sourceFile?: string;
  sourceSheet?: string;
}

export interface WarehouseIngestProcessingPayload {
  batchId:     string;
  rows:        IntentResult[];  // Mỗi row kèm fieldScores và notes
  timestamp:   number;
  requiresConfirmation: boolean;
}

export interface WarehouseIngestPendingPayload {
  batchId:     string;
  rows:        IntentResult[];  // Dữ liệu thô kèm toàn bộ context
  timestamp:   number;
  reason:      string;         // Lý do không xử lý tự động được
}

export interface WarehouseStockUpdatedPayload {
  itemId:      string;
  sku:         string;
  delta:       number;         // + nhập / - xuất
  newQuantity: number;
  unit:        string;
  intent:      WarehouseIntent;
  timestamp:   number;
}

// ─── EVENT ENVELOPE (dùng chung với EventBus) ─────────────────────────────────

export interface WarehouseEvent<T = unknown> {
  type:      WarehouseEventType;
  cellId:    'warehouse-cell';
  payload:   T;
  timestamp: number;
  traceId:   string;           // Để audit-cell trace được
}

/**
 * Factory để tạo event đúng format
 */
export function createWarehouseEvent<T>(
  type: WarehouseEventType,
  payload: T,
  traceId?: string
): WarehouseEvent<T> {
  return {
    type,
    cellId: 'warehouse-cell',
    payload,
    timestamp: Date.now(),
    traceId: traceId ?? `WH-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
}
