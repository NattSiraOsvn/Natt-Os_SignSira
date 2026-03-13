// @ts-nocheck
/**
 * NATT-OS EventBus Guards
 * Lock #7: Idempotency key
 * Lock #8: Causation ordering
 * Lock #9: Back-pressure (không hard limit — chỉ cảnh báo + throttle)
 */
import { EventEnvelope } from "../events/event-envelope";

// ── Lock #7: Idempotency ──
const _processedIds = new Set<string>();
const _idempotencyWindow = 3_600_000; // 1 hour
const _idempotencyTimestamps = new Map<string, number>();

export const IdempotencyGuard = {
  check(envelope: EventEnvelope): boolean {
    const key = `${envelope.event_id}:${envelope.correlation_id}`;
    if (_processedIds.has(key)) {
      console.warn(`[IdempotencyGuard] Duplicate event blocked: ${envelope.event_type} id=${envelope.event_id}`);
      return false; // already processed
    }
    _processedIds.add(key);
    _idempotencyTimestamps.set(key, Date.now());
    return true; // ok to process
  },

  cleanup(): void {
    const cutoff = Date.now() - _idempotencyWindow;
    for (const [key, ts] of _idempotencyTimestamps) {
      if (ts < cutoff) { _processedIds.delete(key); _idempotencyTimestamps.delete(key); }
    }
  },
};

// ── Lock #8: Causation ordering ──
const _pendingByCausation = new Map<string, EventEnvelope[]>(); // waiting for parent

export const OrderingGuard = {
  // Returns true if envelope can be processed now
  canProcess(envelope: EventEnvelope, processedEventIds: Set<string>): boolean {
    if (!envelope.causation_id) return true; // root event, no parent needed
    if (processedEventIds.has(envelope.causation_id)) return true; // parent processed
    // Parent not yet processed — queue
    const queue = _pendingByCausation.get(envelope.causation_id) ?? [];
    queue.push(envelope);
    _pendingByCausation.set(envelope.causation_id, queue);
    console.debug(`[OrderingGuard] Queued ${envelope.event_type} waiting for causation=${envelope.causation_id}`);
    return false;
  },

  // Call after processing an event to release pending children
  release(processedEventId: string): EventEnvelope[] {
    const pending = _pendingByCausation.get(processedEventId) ?? [];
    _pendingByCausation.delete(processedEventId);
    return pending;
  },
};

// ── Lock #9: Back-pressure (không hard limit — adaptive) ──
const _subscriberLatency = new Map<string, number[]>(); // subscriberCell → [latency ms]
const WARN_THRESHOLD_MS = 500;
const ALERT_THRESHOLD_MS = 2000;
const WINDOW_SIZE = 20;

export const BackPressureGuard = {
  recordLatency(subscriberCell: string, latencyMs: number): void {
    const history = _subscriberLatency.get(subscriberCell) ?? [];
    history.push(latencyMs);
    if (history.length > WINDOW_SIZE) history.shift();
    _subscriberLatency.set(subscriberCell, history);

    const avg = history.reduce((s,v) => s+v, 0) / history.length;
    if (avg > ALERT_THRESHOLD_MS) {
      console.error(`[BackPressureGuard] ALERT: ${subscriberCell} avg latency ${avg.toFixed(0)}ms — subscriber overwhelmed`);
    } else if (avg > WARN_THRESHOLD_MS) {
      console.warn(`[BackPressureGuard] WARN: ${subscriberCell} avg latency ${avg.toFixed(0)}ms`);
    }
  },

  getStats(): Record<string, { avg: number; max: number; count: number }> {
    const stats: Record<string, { avg: number; max: number; count: number }> = {};
    for (const [cell, latencies] of _subscriberLatency) {
      stats[cell] = {
        avg: latencies.reduce((s,v) => s+v, 0) / latencies.length,
        max: Math.max(...latencies),
        count: latencies.length,
      };
    }
    return stats;
  },

  isHealthy(subscriberCell: string): boolean {
    const history = _subscriberLatency.get(subscriberCell);
    if (!history?.length) return true;
    const avg = history.reduce((s,v) => s+v, 0) / history.length;
    return avg < ALERT_THRESHOLD_MS;
  },
};
