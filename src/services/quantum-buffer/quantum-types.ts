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