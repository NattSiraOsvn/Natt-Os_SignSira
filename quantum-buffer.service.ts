// quantum-buffer.service.ts — Production-grade local durable queue
// SQLite persistence. Exponential backoff. Idempotency. Crash-safe.

import Database from 'better-sqlite3';
import { createHash, randomUUID } from 'crypto';
import {
  QueueJob, DLQEntry, EnqueueOptions, HandlerMap,
  WorkerConfig, QueueStats, BackoffConfig, QueueStatus
} from './quantum-types';

const DEFAULT_BACKOFF: BackoffConfig = {
  base_ms: 1000,
  max_ms: 300_000,
  multiplier: 2,
  jitter: true,
};

const DEFAULT_WORKER: WorkerConfig = {
  poll_interval_ms: 500,
  batch_size: 5,
  worker_id: `W-${randomUUID().slice(0, 8)}`,
  concurrency: 3,
};

export class QuantumBufferService {
  private db: Database.Database;
  private backoff: BackoffConfig;
  private workerTimer: ReturnType<typeof setInterval> | null = null;
  private activeJobs = 0;
  private workerConfig: WorkerConfig = DEFAULT_WORKER;
  private handlers: HandlerMap = {};
  private shuttingDown = false;

  constructor(dbPath: string = 'quantum-buffer.db', backoff?: Partial<BackoffConfig>) {
    this.db = new Database(dbPath, { verbose: undefined });
    this.backoff = { ...DEFAULT_BACKOFF, ...backoff };
    this.init();
  }

  // ═══════════════════════════════════════════
  // INIT — Schema creation, WAL mode, indexes
  // ═══════════════════════════════════════════

  private init(): void {
    // WAL mode for concurrent reads during writes
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('busy_timeout = 5000');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS quantum_queue (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        priority INTEGER NOT NULL DEFAULT 5,
        attempts INTEGER NOT NULL DEFAULT 0,
        max_attempts INTEGER NOT NULL DEFAULT 5,
        next_run_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        error_log TEXT,
        worker_id TEXT
      );

      CREATE TABLE IF NOT EXISTS quantum_dlq (
        id TEXT PRIMARY KEY,
        original_job_id TEXT NOT NULL,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        failed_reason TEXT NOT NULL,
        attempts INTEGER NOT NULL,
        moved_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_queue_poll
        ON quantum_queue(status, next_run_at, priority)
        WHERE status = 'pending';

      CREATE INDEX IF NOT EXISTS idx_queue_type
        ON quantum_queue(type, status);

      CREATE INDEX IF NOT EXISTS idx_queue_hash
        ON quantum_queue(payload_hash, type)
        WHERE status IN ('pending', 'processing');

      CREATE INDEX IF NOT EXISTS idx_dlq_type
        ON quantum_dlq(type);
    `);

    // Recover crashed jobs: processing → pending on startup
    const recovered = this.db.prepare(`
      UPDATE quantum_queue
      SET status = 'pending', worker_id = NULL, updated_at = ?
      WHERE status = 'processing'
    `).run(Date.now());

    if (recovered.changes > 0) {
      console.log(`[QuantumBuffer] Recovered ${recovered.changes} crashed jobs → pending`);
    }
  }

  // ═══════════════════════════════════════════
  // ENQUEUE — Insert job with idempotency check
  // ═══════════════════════════════════════════

  enqueue(type: string, payload: unknown, options?: EnqueueOptions): string | null {
    const now = Date.now();
    const payloadStr = JSON.stringify(payload);
    const hash = options?.idempotency_key || this.hashPayload(type, payloadStr);

    // Idempotency: skip if identical pending/processing job exists
    const existing = this.db.prepare(`
      SELECT id FROM quantum_queue
      WHERE payload_hash = ? AND type = ? AND status IN ('pending', 'processing')
      LIMIT 1
    `).get(hash, type) as { id: string } | undefined;

    if (existing) {
      console.log(`[QuantumBuffer] Duplicate skipped: ${type} hash=${hash.slice(0, 12)}… (existing: ${existing.id})`);
      return null;
    }

    const id = `QB-${randomUUID().slice(0, 12).toUpperCase()}`;
    const delay = options?.delay_ms || 0;

    this.db.prepare(`
      INSERT INTO quantum_queue
        (id, type, payload, payload_hash, status, priority, attempts, max_attempts, next_run_at, created_at, updated_at)
      VALUES
        (?, ?, ?, ?, 'pending', ?, 0, ?, ?, ?, ?)
    `).run(
      id, type, payloadStr, hash,
      options?.priority ?? 5,
      options?.max_attempts ?? 5,
      now + delay, now, now
    );

    return id;
  }

  // Batch enqueue in single transaction
  enqueueBatch(jobs: Array<{ type: string; payload: unknown; options?: EnqueueOptions }>): string[] {
    const ids: string[] = [];
    const tx = this.db.transaction(() => {
      for (const job of jobs) {
        const id = this.enqueue(job.type, job.payload, job.options);
        if (id) ids.push(id);
      }
    });
    tx();
    return ids;
  }

  // ═══════════════════════════════════════════
  // WORKER — Poll + process + retry/DLQ
  // ═══════════════════════════════════════════

  startWorker(handlers: HandlerMap, config?: Partial<WorkerConfig>): void {
    this.handlers = handlers;
    this.workerConfig = { ...DEFAULT_WORKER, ...config };
    this.shuttingDown = false;

    console.log(`[QuantumBuffer] Worker ${this.workerConfig.worker_id} started (poll: ${this.workerConfig.poll_interval_ms}ms, batch: ${this.workerConfig.batch_size}, concurrency: ${this.workerConfig.concurrency})`);

    this.workerTimer = setInterval(() => {
      if (this.shuttingDown) return;
      this.tick();
    }, this.workerConfig.poll_interval_ms);
  }

  stopWorker(): Promise<void> {
    this.shuttingDown = true;
    if (this.workerTimer) {
      clearInterval(this.workerTimer);
      this.workerTimer = null;
    }

    // Wait for active jobs to finish (max 30s)
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (this.activeJobs === 0) {
          clearInterval(check);
          console.log(`[QuantumBuffer] Worker ${this.workerConfig.worker_id} stopped gracefully`);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(check);
        console.log(`[QuantumBuffer] Worker force-stopped with ${this.activeJobs} active jobs`);
        resolve();
      }, 30_000);
    });
  }

  private tick(): void {
    const available = this.workerConfig.concurrency - this.activeJobs;
    if (available <= 0) return;

    const limit = Math.min(available, this.workerConfig.batch_size);
    const now = Date.now();

    // Atomic claim: SELECT + UPDATE in transaction
    const jobs = this.claimJobs(limit, now);

    for (const job of jobs) {
      this.processJob(job);
    }
  }

  private claimJobs(limit: number, now: number): QueueJob[] {
    const workerId = this.workerConfig.worker_id;

    const claim = this.db.transaction(() => {
      const rows = this.db.prepare(`
        SELECT * FROM quantum_queue
        WHERE status = 'pending' AND next_run_at <= ?
        ORDER BY priority ASC, next_run_at ASC
        LIMIT ?
      `).all(now, limit) as QueueJob[];

      if (rows.length === 0) return [];

      const ids = rows.map(r => r.id);
      const placeholders = ids.map(() => '?').join(',');

      this.db.prepare(`
        UPDATE quantum_queue
        SET status = 'processing', worker_id = ?, updated_at = ?
        WHERE id IN (${placeholders})
      `).run(workerId, now, ...ids);

      return rows;
    });

    return claim();
  }

  private async processJob(job: QueueJob): Promise<void> {
    const handler = this.handlers[job.type];
    if (!handler) {
      console.error(`[QuantumBuffer] No handler for type: ${job.type}`);
      this.failJob(job, `No handler registered for type: ${job.type}`);
      return;
    }

    this.activeJobs++;
    const startTime = Date.now();

    try {
      const payload = JSON.parse(job.payload);
      await handler(payload, job);
      this.completeJob(job, startTime);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.failJob(job, message);
    } finally {
      this.activeJobs--;
    }
  }

  private completeJob(job: QueueJob, startTime: number): void {
    const duration = Date.now() - startTime;
    this.db.prepare(`
      UPDATE quantum_queue
      SET status = 'done', updated_at = ?, error_log = NULL
      WHERE id = ?
    `).run(Date.now(), job.id);

    console.log(`[QuantumBuffer] ✓ ${job.type} ${job.id} done (${duration}ms, attempt ${job.attempts + 1})`);
  }

  private failJob(job: QueueJob, reason: string): void {
    const now = Date.now();
    const nextAttempt = job.attempts + 1;

    if (nextAttempt >= job.max_attempts) {
      // Move to DLQ
      this.moveToDLQ(job, reason);
      return;
    }

    // Schedule retry with exponential backoff
    const delayMs = this.calculateBackoff(nextAttempt);
    const nextRun = now + delayMs;

    this.db.prepare(`
      UPDATE quantum_queue
      SET status = 'pending',
          attempts = ?,
          next_run_at = ?,
          updated_at = ?,
          error_log = ?,
          worker_id = NULL
      WHERE id = ?
    `).run(nextAttempt, nextRun, now, reason, job.id);

    console.log(`[QuantumBuffer] ⟳ ${job.type} ${job.id} retry ${nextAttempt}/${job.max_attempts} in ${delayMs}ms: ${reason}`);
  }

  // ═══════════════════════════════════════════
  // BACKOFF — Exponential with bounded jitter
  // ═══════════════════════════════════════════

  private calculateBackoff(attempt: number): number {
    const { base_ms, max_ms, multiplier, jitter } = this.backoff;
    let delay = base_ms * Math.pow(multiplier, attempt - 1);
    delay = Math.min(delay, max_ms);

    if (jitter) {
      // ±10% deterministic jitter
      const jitterRange = delay * 0.1;
      delay += (Math.random() * 2 - 1) * jitterRange;
    }

    return Math.round(delay);
  }

  // ═══════════════════════════════════════════
  // DLQ — Dead letter queue
  // ═══════════════════════════════════════════

  private moveToDLQ(job: QueueJob, reason: string): void {
    const now = Date.now();

    const tx = this.db.transaction(() => {
      // Insert into DLQ
      this.db.prepare(`
        INSERT INTO quantum_dlq
          (id, original_job_id, type, payload, payload_hash, failed_reason, attempts, moved_at)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `DLQ-${randomUUID().slice(0, 12).toUpperCase()}`,
        job.id, job.type, job.payload, job.payload_hash,
        reason, job.attempts + 1, now
      );

      // Mark original as dlq
      this.db.prepare(`
        UPDATE quantum_queue
        SET status = 'dlq', updated_at = ?, error_log = ?
        WHERE id = ?
      `).run(now, reason, job.id);
    });

    tx();
    console.log(`[QuantumBuffer] ☠ ${job.type} ${job.id} → DLQ after ${job.attempts + 1} attempts: ${reason}`);
  }

  // ═══════════════════════════════════════════
  // DLQ OPERATIONS — Inspect, retry, purge
  // ═══════════════════════════════════════════

  getDLQ(type?: string, limit: number = 50): DLQEntry[] {
    if (type) {
      return this.db.prepare(
        'SELECT * FROM quantum_dlq WHERE type = ? ORDER BY moved_at DESC LIMIT ?'
      ).all(type, limit) as DLQEntry[];
    }
    return this.db.prepare(
      'SELECT * FROM quantum_dlq ORDER BY moved_at DESC LIMIT ?'
    ).all(limit) as DLQEntry[];
  }

  retryFromDLQ(dlqId: string, options?: EnqueueOptions): string | null {
    const entry = this.db.prepare(
      'SELECT * FROM quantum_dlq WHERE id = ?'
    ).get(dlqId) as DLQEntry | undefined;

    if (!entry) return null;

    const tx = this.db.transaction(() => {
      this.db.prepare('DELETE FROM quantum_dlq WHERE id = ?').run(dlqId);
    });
    tx();

    return this.enqueue(entry.type, JSON.parse(entry.payload), {
      ...options,
      idempotency_key: `RETRY-${entry.original_job_id}-${Date.now()}`,
    });
  }

  retryAllDLQ(type?: string): number {
    const entries = this.getDLQ(type, 1000);
    let count = 0;
    for (const entry of entries) {
      if (this.retryFromDLQ(entry.id)) count++;
    }
    return count;
  }

  purgeDLQ(type?: string): number {
    if (type) {
      return this.db.prepare('DELETE FROM quantum_dlq WHERE type = ?').run(type).changes;
    }
    return this.db.prepare('DELETE FROM quantum_dlq').run().changes;
  }

  // ═══════════════════════════════════════════
  // STATS — Observability
  // ═══════════════════════════════════════════

  getStats(): QueueStats {
    const counts = this.db.prepare(`
      SELECT status, COUNT(*) as count FROM quantum_queue GROUP BY status
    `).all() as Array<{ status: string; count: number }>;

    const map: Record<string, number> = {};
    let total = 0;
    for (const row of counts) {
      map[row.status] = row.count;
      total += row.count;
    }

    const dlqCount = (this.db.prepare(
      'SELECT COUNT(*) as count FROM quantum_dlq'
    ).get() as { count: number }).count;

    const oldest = this.db.prepare(`
      SELECT MIN(created_at) as oldest FROM quantum_queue WHERE status = 'pending'
    `).get() as { oldest: number | null };

    return {
      pending: map['pending'] || 0,
      processing: map['processing'] || 0,
      done: map['done'] || 0,
      failed: map['failed'] || 0,
      dlq: dlqCount,
      total,
      oldest_pending_age_ms: oldest.oldest ? Date.now() - oldest.oldest : null,
    };
  }

  getJobsByType(type: string, status?: QueueStatus, limit: number = 20): QueueJob[] {
    if (status) {
      return this.db.prepare(
        'SELECT * FROM quantum_queue WHERE type = ? AND status = ? ORDER BY created_at DESC LIMIT ?'
      ).all(type, status, limit) as QueueJob[];
    }
    return this.db.prepare(
      'SELECT * FROM quantum_queue WHERE type = ? ORDER BY created_at DESC LIMIT ?'
    ).all(type, limit) as QueueJob[];
  }

  // ═══════════════════════════════════════════
  // MAINTENANCE — Cleanup old done jobs
  // ═══════════════════════════════════════════

  purgeCompleted(olderThanMs: number = 86_400_000): number {
    const cutoff = Date.now() - olderThanMs;
    return this.db.prepare(
      "DELETE FROM quantum_queue WHERE status = 'done' AND updated_at < ?"
    ).run(cutoff).changes;
  }

  // ═══════════════════════════════════════════
  // UTILS
  // ═══════════════════════════════════════════

  private hashPayload(type: string, payload: string): string {
    return createHash('sha256').update(`${type}:${payload}`).digest('hex');
  }

  close(): void {
    if (this.workerTimer) clearInterval(this.workerTimer);
    this.db.close();
  }
}

// Singleton for goldmaster integration
let _instance: QuantumBufferService | null = null;

export function getQuantumBuffer(dbPath?: string): QuantumBufferService {
  if (!_instance) {
    _instance = new QuantumBufferService(dbPath);
  }
  return _instance;
}

export const QuantumBuffer = {
  // Backwards-compatible API for existing goldmaster code
  enqueue(item: { type: string; priority?: number; [key: string]: unknown }): string | null {
    const { type, priority, ...payload } = item;
    return getQuantumBuffer().enqueue(type, payload, { priority });
  }
};
