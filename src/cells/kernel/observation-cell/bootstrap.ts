/**
 * ObservationCell bootstrap — bật read-only awareness layer.
 *
 * Per SPEC NEN v1.1:
 *   §9.2 — Observation = field pull (read-only, publish snapshot)
 *   §6   — He mien dich: Observation -> ChromaticSnapshotPublisher -> Quantum Defense
 *
 * Flow:
 *   1. Subscribe EventBus -> SignalStreamReader
 *   2. ObservationCellService nhan signal -> compute snapshot
 *   3. ChromaticSnapshotPublisher map snapshot -> chromatic -> emit
 *   4. Quantum Defense subscribe 'constitutional.response' -> react
 *
 * Singleton — chi bootstrap 1 lan.
 */

import { EventBus } from "../../../core/events/event-bus";
import { ObservationCellService } from "./domain/services";
import { ChromaticSnapshotPublisher } from "./infrastructure";
import type { SignalEvent, SignalStreamReader } from "./ports";

let _instance: ObservationCellService | null = null;

class EventBusSignalReader implements SignalStreamReader {
  onSignal(handler: (event: SignalEvent) => void): () => void {
    const wrapper = (envelope: any) => {
      // Map EventBus envelope -> SignalEvent shape
      if (!envelope?.payload?.signature) return;
      handler({
        signature: envelope.payload.signature,
        event_type: envelope.event_type,
        origin_cell: envelope.origin_cell,
      } as SignalEvent);
    };
    EventBus.subscribe("*", wrapper, "observation-cell");
    return () => {
      // EventBus chua expose unsubscribe — log marker, no-op
      console.debug("[observation-cell] unsubscribe requested");
    };
  }
}

export function bootstrapObservationCell(): ObservationCellService {
  if (_instance) return _instance;

  const reader = new EventBusSignalReader();
  const publisher = new ChromaticSnapshotPublisher();

  _instance = new ObservationCellService(reader, publisher);
  _instance.start();

  console.log("[observation-cell] ✅ Read-only awareness online — chromatic immune wire active");
  return _instance;
}

export function getObservationCell(): ObservationCellService {
  if (!_instance) throw new Error("[observation-cell] Not bootstrapped");
  return _instance;
}
