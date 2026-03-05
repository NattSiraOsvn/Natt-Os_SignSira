#!/usr/bin/env python3
"""
Run from goldmaster root:
  python3 quantum_buffer_install.py
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
QB = os.path.join(ROOT, 'src', 'services', 'quantum-buffer')
os.makedirs(QB, exist_ok=True)

def write(name, content):
    path = os.path.join(QB, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  ✓ {name} ({content.count(chr(10))}L)')

# ══════════════════════════════════════
print('[1/6] quantum-types.ts')
write('quantum-types.ts', r"""
export type QueueStatus = 'pending' | 'processing' | 'done' | 'failed' | 'dlq';

export interface QueueJob {
  id: string;
  type: string;
  payload: string;
  payload_hash: string;
  status: QueueStatus;
  priority: number;
  attempts: number;
  max_attempts: number;
  next_run_at: number;
  created_at: number;
  updated_at: number;
  error_log: string | null;
  worker_id: string | null;
}

export interface DLQEntry {
  id: string;
  original_job_id: string;
  type: string;
  payload: string;
  payload_hash: string;
  failed_reason: string;
  attempts: number;
  moved_at: number;
}

export interface EnqueueOptions {
  priority?: number;
  max_attempts?: number;
  delay_ms?: number;
  idempotency_key?: string;
}

export type JobHandler = (payload: unknown, job: QueueJob) => Promise<void>;
export interface HandlerMap { [jobType: string]: JobHandler; }

export interface WorkerConfig {
  poll_interval_ms: number;
  batch_size: number;
  worker_id: string;
  concurrency: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  done: number;
  failed: number;
  dlq: number;
  total: number;
  oldest_pending_age_ms: number | null;
}

export interface BackoffConfig {
  base_ms: number;
  max_ms: number;
  multiplier: number;
  jitter: boolean;
}
""".strip())

# ══════════════════════════════════════
print('[2/6] quantum-buffer.service.ts')
write('quantum-buffer.service.ts', r"""
import Database from 'better-sqlite3';
import { createHash, randomUUID } from 'crypto';
import {
  QueueJob, DLQEntry, EnqueueOptions, HandlerMap,
  WorkerConfig, QueueStats, BackoffConfig, QueueStatus
} from './quantum-types';

const DEFAULT_BACKOFF: BackoffConfig = {
  base_ms: 1000, max_ms: 300_000, multiplier: 2, jitter: true,
};

const DEFAULT_WORKER: WorkerConfig = {
  poll_interval_ms: 500, batch_size: 5,
  worker_id: `W-${randomUUID().slice(0, 8)}`, concurrency: 3,
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
    this.db = new Database(dbPath);
    this.backoff = { ...DEFAULT_BACKOFF, ...backoff };
    this.init();
  }

  private init(): void {
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
      CREATE INDEX IF NOT EXISTS idx_queue_poll ON quantum_queue(status, next_run_at, priority) WHERE status = 'pending';
      CREATE INDEX IF NOT EXISTS idx_queue_hash ON quantum_queue(payload_hash, type) WHERE status IN ('pending', 'processing');
      CREATE INDEX IF NOT EXISTS idx_dlq_type ON quantum_dlq(type);
    `);

    const recovered = this.db.prepare(
      `UPDATE quantum_queue SET status = 'pending', worker_id = NULL, updated_at = ? WHERE status = 'processing'`
    ).run(Date.now());
    if (recovered.changes > 0) console.log(`[QuantumBuffer] Recovered ${recovered.changes} crashed jobs`);
  }

  enqueue(type: string, payload: unknown, options?: EnqueueOptions): string | null {
    const now = Date.now();
    const payloadStr = JSON.stringify(payload);
    const hash = options?.idempotency_key || this.hashPayload(type, payloadStr);

    const existing = this.db.prepare(
      `SELECT id FROM quantum_queue WHERE payload_hash = ? AND type = ? AND status IN ('pending', 'processing') LIMIT 1`
    ).get(hash, type) as { id: string } | undefined;

    if (existing) {
      console.log(`[QuantumBuffer] Duplicate skipped: ${type} hash=${hash.slice(0, 12)}`);
      return null;
    }

    const id = `QB-${randomUUID().slice(0, 12).toUpperCase()}`;
    this.db.prepare(
      `INSERT INTO quantum_queue (id, type, payload, payload_hash, status, priority, attempts, max_attempts, next_run_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', ?, 0, ?, ?, ?, ?)`
    ).run(id, type, payloadStr, hash, options?.priority ?? 5, options?.max_attempts ?? 5, now + (options?.delay_ms || 0), now, now);
    return id;
  }

  enqueueBatch(jobs: Array<{ type: string; payload: unknown; options?: EnqueueOptions }>): string[] {
    const ids: string[] = [];
    this.db.transaction(() => { for (const j of jobs) { const id = this.enqueue(j.type, j.payload, j.options); if (id) ids.push(id); } })();
    return ids;
  }

  startWorker(handlers: HandlerMap, config?: Partial<WorkerConfig>): void {
    this.handlers = handlers;
    this.workerConfig = { ...DEFAULT_WORKER, ...config };
    this.shuttingDown = false;
    console.log(`[QuantumBuffer] Worker ${this.workerConfig.worker_id} started`);
    this.workerTimer = setInterval(() => { if (!this.shuttingDown) this.tick(); }, this.workerConfig.poll_interval_ms);
  }

  stopWorker(): Promise<void> {
    this.shuttingDown = true;
    if (this.workerTimer) { clearInterval(this.workerTimer); this.workerTimer = null; }
    return new Promise((resolve) => {
      const check = setInterval(() => { if (this.activeJobs === 0) { clearInterval(check); resolve(); } }, 100);
      setTimeout(() => { clearInterval(check); resolve(); }, 30_000);
    });
  }

  private tick(): void {
    const available = this.workerConfig.concurrency - this.activeJobs;
    if (available <= 0) return;
    const jobs = this.claimJobs(Math.min(available, this.workerConfig.batch_size), Date.now());
    for (const job of jobs) this.processJob(job);
  }

  private claimJobs(limit: number, now: number): QueueJob[] {
    return this.db.transaction(() => {
      const rows = this.db.prepare(
        `SELECT * FROM quantum_queue WHERE status = 'pending' AND next_run_at <= ? ORDER BY priority ASC, next_run_at ASC LIMIT ?`
      ).all(now, limit) as QueueJob[];
      if (rows.length === 0) return [];
      const ids = rows.map(r => r.id);
      this.db.prepare(
        `UPDATE quantum_queue SET status = 'processing', worker_id = ?, updated_at = ? WHERE id IN (${ids.map(() => '?').join(',')})`
      ).run(this.workerConfig.worker_id, now, ...ids);
      return rows;
    })();
  }

  private async processJob(job: QueueJob): Promise<void> {
    const handler = this.handlers[job.type];
    if (!handler) { this.failJob(job, `No handler for: ${job.type}`); return; }
    this.activeJobs++;
    const start = Date.now();
    try {
      await handler(JSON.parse(job.payload), job);
      this.db.prepare(`UPDATE quantum_queue SET status = 'done', updated_at = ? WHERE id = ?`).run(Date.now(), job.id);
      console.log(`[QuantumBuffer] ✓ ${job.type} ${job.id} done (${Date.now() - start}ms)`);
    } catch (err) {
      this.failJob(job, err instanceof Error ? err.message : String(err));
    } finally { this.activeJobs--; }
  }

  private failJob(job: QueueJob, reason: string): void {
    const next = job.attempts + 1;
    if (next >= job.max_attempts) { this.moveToDLQ(job, reason); return; }
    const delay = this.calculateBackoff(next);
    this.db.prepare(
      `UPDATE quantum_queue SET status = 'pending', attempts = ?, next_run_at = ?, updated_at = ?, error_log = ?, worker_id = NULL WHERE id = ?`
    ).run(next, Date.now() + delay, Date.now(), reason, job.id);
    console.log(`[QuantumBuffer] ⟳ ${job.type} ${job.id} retry ${next}/${job.max_attempts} in ${delay}ms`);
  }

  private calculateBackoff(attempt: number): number {
    let delay = this.backoff.base_ms * Math.pow(this.backoff.multiplier, attempt - 1);
    delay = Math.min(delay, this.backoff.max_ms);
    if (this.backoff.jitter) delay += (Math.random() * 2 - 1) * delay * 0.1;
    return Math.round(delay);
  }

  private moveToDLQ(job: QueueJob, reason: string): void {
    const now = Date.now();
    this.db.transaction(() => {
      this.db.prepare(
        `INSERT INTO quantum_dlq (id, original_job_id, type, payload, payload_hash, failed_reason, attempts, moved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(`DLQ-${randomUUID().slice(0, 12).toUpperCase()}`, job.id, job.type, job.payload, job.payload_hash, reason, job.attempts + 1, now);
      this.db.prepare(`UPDATE quantum_queue SET status = 'dlq', updated_at = ?, error_log = ? WHERE id = ?`).run(now, reason, job.id);
    })();
    console.log(`[QuantumBuffer] ☠ ${job.type} ${job.id} → DLQ after ${job.attempts + 1} attempts`);
  }

  getDLQ(type?: string, limit: number = 50): DLQEntry[] {
    return type
      ? this.db.prepare('SELECT * FROM quantum_dlq WHERE type = ? ORDER BY moved_at DESC LIMIT ?').all(type, limit) as DLQEntry[]
      : this.db.prepare('SELECT * FROM quantum_dlq ORDER BY moved_at DESC LIMIT ?').all(limit) as DLQEntry[];
  }

  retryFromDLQ(dlqId: string, options?: EnqueueOptions): string | null {
    const entry = this.db.prepare('SELECT * FROM quantum_dlq WHERE id = ?').get(dlqId) as DLQEntry | undefined;
    if (!entry) return null;
    this.db.prepare('DELETE FROM quantum_dlq WHERE id = ?').run(dlqId);
    return this.enqueue(entry.type, JSON.parse(entry.payload), { ...options, idempotency_key: `RETRY-${entry.original_job_id}-${Date.now()}` });
  }

  retryAllDLQ(type?: string): number {
    let count = 0;
    for (const e of this.getDLQ(type, 1000)) { if (this.retryFromDLQ(e.id)) count++; }
    return count;
  }

  purgeDLQ(type?: string): number {
    return type
      ? this.db.prepare('DELETE FROM quantum_dlq WHERE type = ?').run(type).changes
      : this.db.prepare('DELETE FROM quantum_dlq').run().changes;
  }

  getStats(): QueueStats {
    const counts = this.db.prepare('SELECT status, COUNT(*) as count FROM quantum_queue GROUP BY status').all() as Array<{ status: string; count: number }>;
    const map: Record<string, number> = {};
    let total = 0;
    for (const r of counts) { map[r.status] = r.count; total += r.count; }
    const dlqCount = (this.db.prepare('SELECT COUNT(*) as count FROM quantum_dlq').get() as { count: number }).count;
    const oldest = this.db.prepare(`SELECT MIN(created_at) as oldest FROM quantum_queue WHERE status = 'pending'`).get() as { oldest: number | null };
    return { pending: map['pending'] || 0, processing: map['processing'] || 0, done: map['done'] || 0, failed: map['failed'] || 0, dlq: dlqCount, total, oldest_pending_age_ms: oldest.oldest ? Date.now() - oldest.oldest : null };
  }

  getJobsByType(type: string, status?: QueueStatus, limit: number = 20): QueueJob[] {
    return status
      ? this.db.prepare('SELECT * FROM quantum_queue WHERE type = ? AND status = ? ORDER BY created_at DESC LIMIT ?').all(type, status, limit) as QueueJob[]
      : this.db.prepare('SELECT * FROM quantum_queue WHERE type = ? ORDER BY created_at DESC LIMIT ?').all(type, limit) as QueueJob[];
  }

  purgeCompleted(olderThanMs: number = 86_400_000): number {
    return this.db.prepare("DELETE FROM quantum_queue WHERE status = 'done' AND updated_at < ?").run(Date.now() - olderThanMs).changes;
  }

  private hashPayload(type: string, payload: string): string {
    return createHash('sha256').update(`${type}:${payload}`).digest('hex');
  }

  close(): void {
    if (this.workerTimer) clearInterval(this.workerTimer);
    this.db.close();
  }
}

let _instance: QuantumBufferService | null = null;
export function getQuantumBuffer(dbPath?: string): QuantumBufferService {
  if (!_instance) _instance = new QuantumBufferService(dbPath);
  return _instance;
}

export const QuantumBuffer = {
  enqueue(item: { type: string; priority?: number; [key: string]: unknown }): string | null {
    const { type, priority, ...payload } = item;
    return getQuantumBuffer().enqueue(type, payload, { priority });
  }
};
""".strip())

# ══════════════════════════════════════
print('[3/6] quantum-worker.ts')
write('quantum-worker.ts', r"""
import { QuantumBufferService, getQuantumBuffer } from './quantum-buffer.service';
import { HandlerMap, WorkerConfig } from './quantum-types';

export class QuantumWorkerRunner {
  private buffer: QuantumBufferService;
  constructor(dbPath?: string) { this.buffer = getQuantumBuffer(dbPath); }

  start(handlers: HandlerMap, config?: Partial<WorkerConfig>): void {
    const workerId = config?.worker_id || `W-${process.pid}`;
    this.buffer.startWorker(handlers, { ...config, worker_id: workerId });

    const shutdown = async () => {
      console.log(`\n[QuantumWorker] ${workerId} shutting down...`);
      await this.buffer.stopWorker();
      this.buffer.close();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    console.log(`[QuantumWorker] ${workerId} ready.`);
  }

  getBuffer(): QuantumBufferService { return this.buffer; }
}
""".strip())

# ══════════════════════════════════════
print('[4/6] quantum-dlq.service.ts')
write('quantum-dlq.service.ts', r"""
import { QuantumBufferService, getQuantumBuffer } from './quantum-buffer.service';
import { DLQEntry } from './quantum-types';

export class QuantumDLQService {
  private buffer: QuantumBufferService;
  constructor(buffer?: QuantumBufferService) { this.buffer = buffer || getQuantumBuffer(); }

  list(type?: string, limit: number = 50): DLQEntry[] { return this.buffer.getDLQ(type, limit); }
  retry(dlqId: string): string | null { return this.buffer.retryFromDLQ(dlqId); }
  retryAll(type?: string): { retried: number } { return { retried: this.buffer.retryAllDLQ(type) }; }
  purge(type?: string): { purged: number } { return { purged: this.buffer.purgeDLQ(type) }; }

  healthCheck(alertThreshold: number = 10) {
    const entries = this.list(undefined, 1000);
    const byType: Record<string, number> = {};
    const alerts: string[] = [];
    for (const e of entries) byType[e.type] = (byType[e.type] || 0) + 1;
    for (const [type, count] of Object.entries(byType)) {
      if (count >= alertThreshold) alerts.push(`[ALERT] ${type}: ${count} in DLQ`);
    }
    return { healthy: entries.length < alertThreshold, dlq_count: entries.length, by_type: byType, alerts };
  }
}
""".strip())

# ══════════════════════════════════════
print('[5/6] index.ts')
write('index.ts', r"""
export { QuantumBufferService, getQuantumBuffer, QuantumBuffer } from './quantum-buffer.service';
export { QuantumWorkerRunner } from './quantum-worker';
export { QuantumDLQService } from './quantum-dlq.service';
export type { QueueJob, DLQEntry, EnqueueOptions, HandlerMap, WorkerConfig, QueueStats, BackoffConfig, JobHandler, QueueStatus } from './quantum-types';
""".strip())

# ══════════════════════════════════════
print('[6/6] quantum-buffer.test.ts')
write('quantum-buffer.test.ts', r"""
import { QuantumBufferService } from './quantum-buffer.service';
import { QuantumDLQService } from './quantum-dlq.service';
import { unlinkSync, existsSync } from 'fs';

const TEST_DB = '/tmp/quantum-buffer-test.db';
function cleanup() {
  for (const f of [TEST_DB, TEST_DB+'-wal', TEST_DB+'-shm']) { if (existsSync(f)) unlinkSync(f); }
}
function assert(ok: boolean, msg: string) { if (!ok) throw new Error(`FAIL: ${msg}`); console.log(`  ✓ ${msg}`); }
async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function test() {
  cleanup();
  const buffer = new QuantumBufferService(TEST_DB, { base_ms: 100, max_ms: 2000, multiplier: 2 });
  const dlq = new QuantumDLQService(buffer);

  console.log('\n[TEST 1] Basic enqueue');
  const id1 = buffer.enqueue('TEST_JOB', { message: 'hello' });
  assert(id1 !== null, `Job enqueued: ${id1}`);
  assert(buffer.getStats().pending === 1, 'Pending: 1');

  console.log('\n[TEST 2] Idempotency');
  const id2 = buffer.enqueue('TEST_JOB', { message: 'hello' });
  assert(id2 === null, 'Duplicate rejected');
  assert(buffer.getStats().pending === 1, 'Still 1 pending');

  console.log('\n[TEST 3] Different payload OK');
  const id3 = buffer.enqueue('TEST_JOB', { message: 'world' });
  assert(id3 !== null, 'Different payload accepted');

  console.log('\n[TEST 4] Worker processes jobs');
  const processed: string[] = [];
  buffer.startWorker({
    'TEST_JOB': async (p: any) => { processed.push(p.message); },
  }, { poll_interval_ms: 50, batch_size: 10, concurrency: 5, worker_id: 'T1' });
  await sleep(500);
  await buffer.stopWorker();
  assert(processed.length >= 2, `Processed ${processed.length} jobs`);
  assert(buffer.getStats().done >= 2, `Done: ${buffer.getStats().done}`);

  console.log('\n[TEST 5] Retry + backoff');
  let failCount = 0;
  buffer.enqueue('FAIL_JOB', { fail: true }, { max_attempts: 3 });
  buffer.startWorker({
    'FAIL_JOB': async () => { failCount++; throw new Error(`Fail #${failCount}`); },
  }, { poll_interval_ms: 50, batch_size: 5, concurrency: 3, worker_id: 'T2' });
  await sleep(2000);
  await buffer.stopWorker();
  assert(failCount >= 3, `Failed ${failCount} times`);

  console.log('\n[TEST 6] DLQ');
  const dlqEntries = dlq.list('FAIL_JOB');
  assert(dlqEntries.length >= 1, `DLQ has ${dlqEntries.length} entries`);
  assert(dlqEntries[0].attempts === 3, `DLQ attempts: ${dlqEntries[0].attempts}`);

  console.log('\n[TEST 7] DLQ retry');
  const retryId = dlq.retry(dlqEntries[0].id);
  assert(retryId !== null, `Retried: ${retryId}`);

  console.log('\n[TEST 8] Batch enqueue');
  const batchIds = buffer.enqueueBatch([
    { type: 'BATCH', payload: { i: 1 } },
    { type: 'BATCH', payload: { i: 2 } },
    { type: 'BATCH', payload: { i: 3 } },
  ]);
  assert(batchIds.length === 3, `Batch: ${batchIds.length}`);

  console.log('\n[TEST 9] Crash recovery');
  buffer.close();
  const b2 = new QuantumBufferService(TEST_DB);
  assert(b2.getStats().processing === 0, 'No orphaned processing jobs');
  b2.close();

  console.log('\n' + '='.repeat(50));
  console.log('✅ ALL 9 TESTS PASSED');
  console.log('='.repeat(50));
  cleanup();
}

test().catch(e => { console.error('❌', e.message); cleanup(); process.exit(1); });
""".strip())

print('\n' + '='*50)
print('✅ All 6 files created in src/services/quantum-buffer/')
print('Run test:')
print('  cd src/services/quantum-buffer && npx tsx quantum-buffer.test.ts')
print('='*50)
