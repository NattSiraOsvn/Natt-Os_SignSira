/**
 * ChromaticSnapshotPublisher — Mạch nối đầu tiên của hệ miễn dịch.
 *
 * Per SPEC NEN v1.1:
 *   §6  — Hệ miễn dịch đa tầng (kernel-M wire)
 *   §9.2 — Observation = field pull (read-only, publish snapshot)
 *   §9.3 — Chromatic = 5 layer (L0 pheromone → L4 UI)
 *   §9.4 — Quantum Defense = react theo chromatic, không chặn trước
 *   LAW-1 — Publisher KHÔNG decide, chỉ map snapshot → chromatic state
 *   LAW-4 — Không hardcode true/false, dùng touch helper
 *
 * Vai: implement SnapshotPublisher port.
 *   - Nhận ObservationSnapshot từ ObservationCellService
 *   - Map (coherence, entropy, anomaly) → ChromaticState
 *   - Emit 'constitutional.response' event vào EventBus
 *   - Quantum Defense tự subscribe (đã có sẵn)
 *
 * KHÔNG touch:
 *   - ObservationCellService (giữ nguyên vai read-only)
 *   - QuantumDefenseEngine (giữ nguyên vai react)
 *   - ChromaticState engine (giữ nguyên 7 màu spectrum)
 *
 * Đây là MẠCH THỨ NHẤT của hệ miễn dịch sống.
 */

import type { SnapshotPublisher } from "../ports/SnapshotPublisher";
import type { ObservationSnapshot } from "../domain/entities/ObservationSnapshot";
import { EventBus } from "../../../../core/events/event-bus";
import { touch, type ChromaticState } from "../../../../core/chromatic/touch-result";

export class ChromaticSnapshotPublisher implements SnapshotPublisher {
  /**
   * publish — Map snapshot → chromatic → emit immune signal.
   *
   * Map rule (per SPEC NEN §16.3 Chromatic Immune Spectrum):
   *   anomaly + entropy>0.85          → critical (đỏ)
   *   anomaly + coherence<0.2         → risk     (vàng)
   *   anomaly                          → warning  (cam)
   *   entropy>0.6                      → drift    (lục)
   *   coherence>0.8 + low entropy      → optimal  (tím)
   *   coherence>0.5                    → stable   (chàm)
   *   default                          → nominal  (lam)
   */
  publish(snapshot: ObservationSnapshot): void {
    const chromatic = this.mapToChromatic(snapshot);
    const result = touch("observation:snapshot", chromatic, this.reasonOf(snapshot));

    EventBus.emit("constitutional.response", {
      response: "OBSERVE",
      trigger: "observation_snapshot",
      source_cell: "observation-cell",
      chromatic: result.chromatic_state,
      description: `coherence=${snapshot.coherence.toFixed(2)} entropy=${snapshot.entropy.toFixed(2)} anomaly=${snapshot.anomaly}`,
      data: {
        snapshot_id: snapshot.snapshot_id,
        taken_at: snapshot.taken_at,
        coherence: snapshot.coherence,
        entropy: snapshot.entropy,
        pattern: snapshot.pattern,
        anomaly: snapshot.anomaly,
        signature: result.signature,
      },
      timestamp: snapshot.taken_at,
    });
  }

  private mapToChromatic(s: ObservationSnapshot): ChromaticState {
    if (s.anomaly && s.entropy > 0.85) return "critical";
    if (s.anomaly && s.coherence < 0.2) return "risk";
    if (s.anomaly) return "warning";
    if (s.entropy > 0.6) return "drift";
    if (s.coherence > 0.8 && s.entropy < 0.3) return "optimal";
    if (s.coherence > 0.5) return "stable";
    return "nominal";
  }

  private reasonOf(s: ObservationSnapshot): string {
    if (s.anomaly) return "anomaly_detected";
    if (s.pattern.length > 0) return `pattern_${s.pattern.length}_origins`;
    return "field_steady";
  }
}
