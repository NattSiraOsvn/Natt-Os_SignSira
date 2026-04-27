import type { ObservationSnapshot } from "../domain/entities";

export interface ObservationCellSmartLinkEnvelope {
  source: "observation-cell";
  snapshot_id: string;
  payload: ObservationSnapshot;
}

export function toObservationCellSmartLinkEnvelope(
  payload: ObservationSnapshot,
): ObservationCellSmartLinkEnvelope {
  return {
    source: "observation-cell",
    snapshot_id: payload.snapshot_id,
    payload,
  };
}
