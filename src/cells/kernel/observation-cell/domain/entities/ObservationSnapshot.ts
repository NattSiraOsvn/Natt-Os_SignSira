/**
 * ObservationSnapshot — Read-only state of field at a moment.
 * Per SPEC NEN v1.0 section 4.2: output of observation layer.
 *
 * Snapshot is in-memory, ephemeral. Consumers (SmartLink/QNEU/ISEU/Quantum)
 * read via field pull, observation does NOT push.
 */
export interface ObservationSnapshot {
  /** Timestamp of snapshot (ISO 8601) */
  taken_at: string;

  /** Coherence — continuity/stability of behavior in field [0..1] */
  coherence: number;

  /** Entropy — disorder in field [0..1, where 1 = max chaos] */
  entropy: number;

  /** Detected patterns (signal type clusters, frequency markers) */
  pattern: string[];

  /** Anomaly flag — true if entropy spikes or coherence drops abnormally */
  anomaly?: boolean;

  /** Snapshot identifier (generated, traceable) */
  snapshot_id: string;
}

/**
 * Generate snapshot ID — ephemeral, monotonic.
 * Format: SNAP-<base36-timestamp>-<random4>
 */
export function generateSnapshotId(ts: number): string {
  const timeBase36 = ts.toString(36);
  const random4 = Math.random().toString(36).slice(2, 6);
  return "SNAP-" + timeBase36 + "-" + random4;
}
