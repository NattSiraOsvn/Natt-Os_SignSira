/**
 * SnapshotPublisher — Port for publishing observation snapshot to field.
 *
 * Snapshot is in-memory, ephemeral. Consumers pull via field.
 * Publisher does NOT push to specific consumers — it makes snapshot available.
 */

import type { ObservationSnapshot } from "../domain/entities/ObservationSnapshot";

export interface SnapshotPublisher {
  publish(snapshot: ObservationSnapshot): void;
}
