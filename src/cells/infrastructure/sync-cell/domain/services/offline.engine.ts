// @ts-nocheck
// @ts-nocheck
// @ts-nocheck
// ── FILE 8 ──────────────────────────────────────────────────
// offline.engine.ts
// Xử lý operations khi mất kết nối — queue + sync khi online
// Path: src/cells/infrastructure/sync-cell/domain/services/

export interface OfflineOperation {
  id:        string;
  type:      string;    // 'inventory.out', 'order.create', etc.
  payload:   unknown;
  timestamp: number;
  retries:   number;
}

export interface SyncResult {
  synced:  string[];   // operation IDs thành công
  failed:  string[];   // operation IDs thất bại
  pending: string[];   // còn chờ
}

export class OfflineEngine {
  private queue: Map<string, OfflineOperation> = new Map();
  private readonly MAX_RETRIES = 3;

  enqueue(op: OfflineOperation): void {
    this.queue.set(op.id, { ...op, retries: 0 });
    EventBus.emit('cell.metric', {
      cell: 'sync-cell', metric: 'offline.queued',
      value: this.queue.size, confidence: 1.0,
    });
  }

  async syncAll(
    processor: (op: OfflineOperation) => Promise<boolean>
  ): Promise<SyncResult> {
    const synced: string[] = [];
    const failed: string[] = [];
    const pending: string[] = [];

    for (const [id, op] of this.queue) {
      try {
        const success = await processor(op);
        if (success) {
          this.queue.delete(id);
          synced.push(id);
        } else {
          op.retries++;
          if (op.retries >= this.MAX_RETRIES) {
            this.queue.delete(id);
            failed.push(id);
          } else {
            pending.push(id);
          }
        }
      } catch {
        op.retries++;
        if (op.retries >= this.MAX_RETRIES) { this.queue.delete(id); failed.push(id); }
        else { pending.push(id); }
      }
    }

    EventBus.emit('cell.metric', {
      cell: 'sync-cell', metric: 'offline.sync_result',
      value: synced.length, confidence: 1.0,
      synced: synced.length, failed: failed.length, pending: pending.length,
    });

    return { synced, failed, pending };
  }

  getPending(): OfflineOperation[] { return Array.from(this.queue.values()); }
  getQueueSize(): number { return this.queue.size; }
}
