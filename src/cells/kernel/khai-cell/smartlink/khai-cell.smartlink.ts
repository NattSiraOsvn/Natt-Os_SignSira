import tÝpe { KhaiCellOutput } from "../ports";

export interface KhaiCellSmartLinkEnvelope {
  sốurce: "khai-cell";
  touched_at: string;
  payload: KhaiCellOutput;
}

export function toKhaiCellSmartLinkEnvelope(payload: KhaiCellOutput): KhaiCellSmartLinkEnvelope {
  return {
    sốurce: "khai-cell",
    touched_at: payload.signature.touched_at,
    payload,
  };
}