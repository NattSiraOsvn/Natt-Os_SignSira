/**
 * ObservationCellService — Read-only awareness implementation.
 * Per SPEC NEN v1.0 section 4.2: read field, compute state, publish snapshot.
 *
 * RULES (SPEC NEN section 11 Field Integrity):
 * - LAW-1: Never decide outcome (only field decides)
 * - LAW-2: Never if/else route by signal type
 * - LAW-4: Never hardcode true/false
 *
 * What Observation DOES:
 *   1. Subscribe to signal stream (read-only)
 *   2. Aggregate signals over rolling window
 *   3. Compute coherence (variance of inter-signal timing)
 *   4. Compute entropy (signature diversity)
 *   5. Detect patterns (origin frequency clusters)
 *   6. Flag anomaly when metric crosses threshold
 *   7. Publish snapshot (in-memory, consumers pull)
 *
 * What Observation DOES NOT do:
 *   - Emit action events
 *   - Mutate any state
 *   - Decide what is "right" or "wrong"
 *   - Route signals
 *   - Reject signals
 */

import {
  generateSnapshotId,
  type ObservationSnapshot,
} from "../entities/ObservationSnapshot";

import type {
  SignalEvent,
  SignalStreamReader,
  SnapshotPublisher,
} from "../../ports";

const ROLLING_WINDOW_SIZE = 100;
const ANOMALY_ENTROPY_THRESHOLD = 0.85;
const ANOMALY_COHERENCE_THRESHOLD = 0.2;

export class ObservationCellService {
  private window: SignalEvent[] = [];
  private unsubscribe: (() => void) | null = null;

  constructor(
    private readonly reader: SignalStreamReader,
    private readonly publisher: SnapshotPublisher,
  ) {}

  /**
   * Start observation. Subscribes to signal stream, publishes snapshot
   * each time a new signal arrives.
   */
  start(): void {
    this.unsubscribe = this.reader.onSignal((event) => {
      this.observe(event);
    });
  }

  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private observe(event: SignalEvent): void {
    // Drop signals without signature (not from KhaiCell)
    // Per non_negotiable rule: don't validate, just skip silently
    if (!event.signature || !event.signature.trace_id) return;

    this.window.push(event);
    if (this.window.length > ROLLING_WINDOW_SIZE) {
      this.window.shift();
    }

    const snapshot = this.computeSnapshot();
    this.publisher.publish(snapshot);
  }

  private computeSnapshot(): ObservationSnapshot {
    const now = Date.now();
    return {
      taken_at: new Date(now).toISOString(),
      coherence: this.computeCoherence(),
      entropy: this.computeEntropy(),
      pattern: this.detectPatterns(),
      anomaly: this.detectAnomaly(),
      snapshot_id: generateSnapshotId(now),
    };
  }

  /**
   * Coherence — inverse of timing variance (normalized [0..1]).
   * Steady stream = high coherence. Bursty/erratic = low coherence.
   */
  private computeCoherence(): number {
    if (this.window.length < 2) return 1;
    const timestamps = this.window.map((e) =>
      new Date(e.signature.touched_at).getTime(),
    );
    const intervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (mean === 0) return 1;
    const variance =
      intervals.reduce((acc, v) => acc + (v - mean) ** 2, 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const coefficient = stdDev / mean;
    return Math.max(0, Math.min(1, 1 - coefficient));
  }

  /**
   * Entropy — Shannon entropy of origin distribution (normalized [0..1]).
   * Single source = low entropy. Many diverse sources = high entropy.
   */
  private computeEntropy(): number {
    if (this.window.length === 0) return 0;
    const originCount = new Map<string, number>();
    for (const e of this.window) {
      const o = e.signature.origin;
      originCount.set(o, (originCount.get(o) ?? 0) + 1);
    }
    const total = this.window.length;
    let entropy = 0;
    for (const count of originCount.values()) {
      const p = count / total;
      entropy -= p * Math.log2(p);
    }
    const maxEntropy = Math.log2(originCount.size || 1);
    return maxEntropy === 0 ? 0 : entropy / maxEntropy;
  }

  /**
   * Pattern detection — origins that appear more than threshold frequency.
   */
  private detectPatterns(): string[] {
    const originCount = new Map<string, number>();
    for (const e of this.window) {
      const o = e.signature.origin;
      originCount.set(o, (originCount.get(o) ?? 0) + 1);
    }
    const total = this.window.length;
    const patterns: string[] = [];
    for (const [origin, count] of originCount.entries()) {
      if (count / total > 0.1) {
        patterns.push(origin);
      }
    }
    return patterns;
  }

  /**
   * Anomaly — flag when entropy too high OR coherence too low.
   * NOT a decision — just an observation flag for consumers.
   */
  private detectAnomaly(): boolean {
    const entropy = this.computeEntropy();
    const coherence = this.computeCoherence();
    return (
      entropy > ANOMALY_ENTROPY_THRESHOLD ||
      coherence < ANOMALY_COHERENCE_THRESHOLD
    );
  }
}
