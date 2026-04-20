import type { KhaiCellOutput } from "../ports";

export interface KhaiCellSmartLinkEnvelope {
  source: "khai-cell";
  touched_at: string;
  payload: KhaiCellOutput;
}

export function toKhaiCellSmartLinkEnvelope(payload: KhaiCellOutput): KhaiCellSmartLinkEnvelope {
  return {
    source: "khai-cell",
    touched_at: payload.signature.touched_at,
    payload,
  };
}
