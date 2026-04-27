/**
 * natt-os EventBus Touch Points (refactored per SPEC NEN v1.1)
 *
 * Lock #7: Idempotency — touch + chromatic emit (no boolean decision)
 * Lock #8: Causation — touch + chromatic emit
 * Lock #9: Back-pressure — chromatic state from latency
 *
 * Per LAW-1 + LAW-4: guards do NOT decide. They mark + emit chromatic.
 * Field reaction = Quantum Defense reads chromatic.
 *
 * Backwards-compat: each touch returns object { proceed, chromatic_state, signature }.
 * Legacy callers reading `.proceed` get same boolean semantics during migration.
 */
import { EventEnvelope } from "../events/event-envelope";

type ChromaticState = "stable" | "nominal" | "drift" | "warning" | "risk" | "critical" | "optimal";

type TouchResult = {
  proceed: boolean;            // legacy compat — derived from chromatic
  chromatic_state: ChromaticState;
  signature: {
    origin: string;
    trace_id: string;
    touched_at: string;
  };
  reason?: string;
};

function makeSignature(origin: string): TouchResult["signature"] {
  return {
    origin,
    trace_id: "TRACE-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10),
    touched_at: new Date().toISOString(),
  };
}

// ── Lock #7: Idempotency ──
const _processedIds = new Set<string>();
const _idempotencyWindow = 3_600_000;
const _idempotencyTimestamps = new Map<string, number>();

export const IdempotencyGuard = {
  check(envelope: EventEnvelope): TouchResult {
    const key = `${envelope.event_id}:${envelope.correlation_id}`;
    const sig = makeSignature("eventbus:idempotency");

    if (_processedIds.has(key)) {
      console.warn(`[IDEMPOTENCY_TOUCH] duplicate event — chromatic: stable | ${envelope.event_type} id=${envelope.event_id}`);
      return {
        proceed: false,
        chromatic_state: "stable",
        signature: sig,
        reason: "already_processed",
      };
    }

    _processedIds.add(key);
    _idempotencyTimestamps.set(key, Date.now());
    return {
      proceed: true,
      chromatic_state: "nominal",
      signature: sig,
    };
  },

  cleanup(): void {
    const cutoff = Date.now() - _idempotencyWindow;
    for (const [key, ts] of _idempotencyTimestamps) {
      if (ts < cutoff) {
        _processedIds.delete(key);
        _idempotencyTimestamps.delete(key);
      }
    }
  },
};

// ── Lock #8: Causation ordering ──
const _pendingByCausation = new Map<string, EventEnvelope[]>();

export const OrderingGuard = {
  canProcess(envelope: EventEnvelope, processedEventIds: Set<string>): TouchResult {
    const sig = makeSignature("eventbus:ordering");

    if (!envelope.causation_id) {
      return {
        proceed: true,
        chromatic_state: "nominal",
        signature: sig,
        reason: "root_event",
      };
    }

    if (processedEventIds.has(envelope.causation_id)) {
      return {
        proceed: true,
        chromatic_state: "nominal",
        signature: sig,
        reason: "parent_processed",
      };
    }

    const queue = _pendingByCausation.get(envelope.causation_id) ?? [];
    queue.push(envelope);
    _pendingByCausation.set(envelope.causation_id, queue);
    console.debug(`[ORDERING_TOUCH] queued — chromatic: warning | ${envelope.event_type} causation=${envelope.causation_id}`);
    return {
      proceed: false,
      chromatic_state: "warning",
      signature: sig,
      reason: "parent_pending",
    };
  },

  release(processedEventId: string): EventEnvelope[] {
    const pending = _pendingByCausation.get(processedEventId) ?? [];
    _pendingByCausation.delete(processedEventId);
    return pending;
  },
};

// ── Lock #9: Back-pressure ──
const _subscriberLatency = new Map<string, number[]>();
const warn_THRESHOLD_MS = 500;
const ALERT_THRESHOLD_MS = 2000;
const WINDOW_SIZE = 20;

export const BackPressureGuard = {
  recordLatency(subscriberCell: string, latencyMs: number): void {
    const history = _subscriberLatency.get(subscriberCell) ?? [];
    history.push(latencyMs);
    if (history.length > WINDOW_SIZE) history.shift();
    _subscriberLatency.set(subscriberCell, history);

    const avg = history.reduce((s, v) => s + v, 0) / history.length;
    if (avg > ALERT_THRESHOLD_MS) {
      console.error(`[BACKPRESSURE_TOUCH] chromatic: critical | ${subscriberCell} avg ${avg.toFixed(0)}ms`);
    } else if (avg > warn_THRESHOLD_MS) {
      console.warn(`[BACKPRESSURE_TOUCH] chromatic: warning | ${subscriberCell} avg ${avg.toFixed(0)}ms`);
    }
  },

  getStats(): Record<string, { avg: number; max: number; count: number }> {
    const stats: Record<string, { avg: number; max: number; count: number }> = {};
    for (const [cell, latencies] of _subscriberLatency) {
      stats[cell] = {
        avg: latencies.reduce((s, v) => s + v, 0) / latencies.length,
        max: Math.max(...latencies),
        count: latencies.length,
      };
    }
    return stats;
  },

  health(subscriberCell: string): TouchResult {
    const sig = makeSignature("eventbus:backpressure");
    const history = _subscriberLatency.get(subscriberCell);

    if (!history?.length) {
      return {
        proceed: true,
        chromatic_state: "nominal",
        signature: sig,
        reason: "no_history",
      };
    }

    const avg = history.reduce((s, v) => s + v, 0) / history.length;
    let state: ChromaticState = "nominal";
    if (avg > ALERT_THRESHOLD_MS) state = "critical";
    else if (avg > warn_THRESHOLD_MS) state = "warning";
    else if (avg < warn_THRESHOLD_MS / 4) state = "optimal";

    return {
      proceed: state !== "critical",
      chromatic_state: state,
      signature: sig,
      reason: `avg_latency_${avg.toFixed(0)}ms`,
    };
  },

  isHealthy(subscriberCell: string): boolean {
    return this.health(subscriberCell).proceed;
  },
};
