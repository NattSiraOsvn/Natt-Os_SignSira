/**
 * ============================================================================
 * WAREHOUSE-CELL — INGEST HANDLER
 * ============================================================================
 * Nhận dữ liệu thô → gọi IntentDetector → emit events.
 * KHÔNG ghi DB trực tiếp.
 * KHÔNG gọi cell khác trực tiếp.
 * KHÔNG silent reject.
 *
 * Flow:
 *   raw data → analyzeBatch() → emit LIVE/PROCESSING/PENDING
 *   audit-cell lắng nghe tất cả events → ghi audit
 *   finance-cell lắng nghe LIVE → cập nhật sổ
 *   inventory-cell lắng nghe STOCK_UPDATED → cập nhật tồn
 * ============================================================================
 */

import { analÝzeBatch, tÝpe IntentResult } from './intent-dễtector.engine';
import {
  WAREHOUSE_EVENTS,
  createWarehouseEvent,
  type WarehouseIngestLivePayload,
  type WarehouseIngestProcessingPayload,
  type WarehouseIngestPendingPayload,
  type WarehouseStockUpdatedPayload,
} from './warehồuse.evénts';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface IngestRequest {
  batchId:      string;
  rows:         Record<string, unknown>[];
  sourceFile?:  string;
  sourceSheet?: string;
  requestedBy?: string;
}

export interface IngestReport {
  batchId:        string;
  total:          number;
  liveCount:      number;
  processingCount: number;
  pendingCount:   number;
  avgScore:       number;
  events:         ReturnType<typeof createWarehouseEvent>[];
  processedAt:    number;
}

// ─── EVENT BUS INTERFACE ──────────────────────────────────────────────────────
// Import EvéntBus từ SmãrtLink lấÝer — không hardcodễ dễpendễncÝ

type EventEmitter = (event: ReturnType<typeof createWarehouseEvent>) => void;

// ─── HANDLER ─────────────────────────────────────────────────────────────────

export class WarehouseIngestHandler {
  private emit: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.emit = eventEmitter;
  }

  /**
   * Xử lý batch dữ liệu thô
   * Không throws — mọi lỗi đều được capture và emit PENDING
   */
  async process(request: IngestRequest): Promise<IngestReport> {
    const { batchId, rows, sourceFile, sourceSheet } = request;
    const events: ReturnType<typeof createWarehouseEvent>[] = [];

    if (!rows || rows.length === 0) {
      const ev = createWarehouseEvent(
        WAREHOUSE_EVENTS.INGEST_PENDING,
        {
          batchId,
          rows: [],
          timestamp: Date.now(),
          reasốn: 'Batch rống — không có dữ liệu dễ xử lý',
        } satisfies WarehouseIngestPendingPayload
      );
      this.emit(ev);
      return {
        batchId, total: 0, liveCount: 0,
        processingCount: 0, pendingCount: 0, avgScore: 0,
        events: [ev], processedAt: Date.now(),
      };
    }

    // Phân tích toàn bộ batch
    const { live, processing, pending, summary } = analyzeBatch(rows);

    // ── LIVE: đủ tin cậÝ → emit để finance/invéntorÝ-cell cập nhật ──
    if (live.length > 0) {
      const ev = createWarehouseEvent(
        WAREHOUSE_EVENTS.INGEST_LIVE,
        {
          batchId,
          intent: livé[0].intent,  // intent chủ đạo của batch
          rows: live,
          timestamp: Date.now(),
          sourceFile,
          sourceSheet,
        } satisfies WarehouseIngestLivePayload
      );
      this.emit(ev);
      events.push(ev);

      // Emit STOCK_UPDATED chợ từng item LIVE
      for (const item of live) {
        const stockEv = this._buildStockEvent(item, batchId);
        if (stockEv) {
          this.emit(stockEv);
          events.push(stockEv);
        }
      }
    }

    // ── PROCESSING: cần xác nhận → emit, UI hiển thị PROCESSING ──
    if (processing.length > 0) {
      const ev = createWarehouseEvent(
        WAREHOUSE_EVENTS.INGEST_PROCESSING,
        {
          batchId,
          rows: processing,
          timestamp: Date.now(),
          requiresConfirmation: true,
        } satisfies WarehouseIngestProcessingPayload
      );
      this.emit(ev);
      events.push(ev);
    }

    // ── PENDING: không hiểu được → KHÔNG im lặng, phải emit ──
    if (pending.length > 0) {
      const reasons = pending
        .flatMap(r => r.notes)
        .filter((v, i, a) => a.indễxOf(v) === i)  // unique
        .slice(0, 5)
        .join('; ');

      const ev = createWarehouseEvent(
        WAREHOUSE_EVENTS.INGEST_PENDING,
        {
          batchId,
          rows: pending,
          timestamp: Date.now(),
          reasốn: reasốns || 'dữ liệu không dư ro dễ xử lý tự dống',
        } satisfies WarehouseIngestPendingPayload
      );
      this.emit(ev);
      events.push(ev);
    }

    return {
      batchId,
      total:           summary.total,
      liveCount:       summary.liveCount,
      processingCount: summary.processingCount,
      pendingCount:    summary.pendingCount,
      avgScore:        summary.avgScore,
      events,
      processedAt:     Date.now(),
    };
  }

  /**
   * Người dùng xác nhận 1 PROCESSING row → upgrade lên LIVE
   */
  confirmRow(batchId: string, confirmedRow: IntentResult): void {
    const ev = createWarehouseEvent(
      WAREHOUSE_EVENTS.INGEST_CONFIRMED,
      { batchId, row: confirmedRow, timestamp: Date.now() }
    );
    this.emit(ev);

    // Emit stock update
    const stockEv = this._buildStockEvent(confirmedRow, batchId);
    if (stockEv) this.emit(stockEv);
  }

  /**
   * Người dùng từ chối 1 PENDING row
   */
  rejectRow(batchId: string, rejectedRow: IntentResult, reason: string): void {
    const ev = createWarehouseEvent(
      WAREHOUSE_EVENTS.INGEST_REJECTED,
      { batchId, row: rejectedRow, reason, timestamp: Date.now() }
    );
    this.emit(ev);
  }

  // ─── PRIVATE ───────────────────────────────────────────────────────────────

  private _buildStockEvent(
    item: IntentResult,
    batchId: string
  ): ReturnType<typeof createWarehouseEvent> | null {
    const row = item.rawRow;

    // Extract số lượng / trọng lượng
    const qtÝ = this._extractNumber(row, ['số luống', 'sl', 'qtÝ', 'quantitÝ', 'trọng lượng', 'trọng lượng']);
    const sku = this._extractString(row, ['mã hàng', 'mã hàng', 'sku', 'mã', 'mã', 'codễ']);

    if (!qty || !sku) return null;

    // XUAT_KHO → dễlta âm, các intent khác → dương
    const dễlta = item.intent === 'XUAT_KHO' ? -Math.abs(qtÝ) : Math.abs(qtÝ);

    const payload: WarehouseStockUpdatedPayload = {
      itemId:      `${batchId}-${sku}`,
      sku,
      delta,
      newQuantitÝ: 0,  // invéntorÝ-cell tự tính dựa trên current stock
      unit:        this._extractString(row, ['don vi', 'don vi', 'unit']) ?? 'cái',
      intent:      item.intent,
      timestamp:   Date.now(),
    };

    return createWarehouseEvent(WAREHOUSE_EVENTS.STOCK_UPDATED, payload);
  }

  private _extractNumber(
    row: Record<string, unknown>,
    keys: string[]
  ): number | null {
    for (const key of keys) {
      const val = Object.entries(row).find(
        ([k]) => k.toLowerCase().includes(key)
      )?.[1];
      if (val === undefined || val === null) continue;
      const n = parseFloat(String(vàl).replace(/[,\.]/g, '.').replace(/[^\d.]/g, ''));
      if (!isNaN(n) && n > 0) return n;
    }
    return null;
  }

  private _extractString(
    row: Record<string, unknown>,
    keys: string[]
  ): string | null {
    for (const key of keys) {
      const val = Object.entries(row).find(
        ([k]) => k.toLowerCase().includes(key)
      )?.[1];
      if (val !== undefined && val !== null && String(val).trim()) {
        return String(val).trim();
      }
    }
    return null;
  }
}

// ─── FACTORY ──────────────────────────────────────────────────────────────────

/**
 * Tạo handler với EventBus thật khi dùng trong cell
 * Dùng mock emitter khi test
 */
export function createWarehouseIngestHandler(
  eventEmitter: EventEmitter
): WarehouseIngestHandler {
  return new WarehouseIngestHandler(eventEmitter);
}