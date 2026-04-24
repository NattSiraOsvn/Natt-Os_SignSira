// src/governance/moments/types.ts

/**
 * Moments — canonical vocabulary cho mọi "moment" trong NATT-OS.
 * KHÔNG dùng generic "event" / "learning" / "insight" — phân loại cứng.
 *
 * Source of truth (canonical ladder):
 *   PRIMARY: docs/specs/SPEC_QIINT_PHYSICS_FOUNDATION_v0.1.na §9 (Phase B.1 ratified)
 *   REF:     bangfs_delta_20260420.canonical §III (historical, pre-B.1)
 *   REF:     src/thienbang.si L195-199 (SuperDictionary)
 *
 * Position: Ontology/runtime axis (Π_system), KHÔNG topology, KHÔNG boundary forensics.
 * Rule seal v0.2 (Phase B.2 ratify).
 */

export type MomentKind =
  | "SCAR"
  | "KHAI_SANG"
  | "GIAC_NGO"
  | "MOTION_TICH_CUC";

/** Shared envelope — mọi Moment có các field này */
export interface MomentBase {
  readonly kind: MomentKind;
  readonly causation: string;          // e.g. "KHAI-20260420-05"
  readonly timestamp_ns: bigint;
  readonly entity: string;              // bang | kim | thienlon | ...
  readonly session_ref: string;         // session id
  readonly sirasign: string;            // sha256 of canonical JSON
}

/** SCAR — passive negative, function break */
export interface Scar extends MomentBase {
  readonly kind: "SCAR";
  readonly scar_class: ScarClass;
  readonly scar_subtype?: string;
  readonly function_broken: string;     // what broke
  readonly evidence: {
    readonly observed: string;
    readonly expected: string;
  };
  readonly recurrence_of?: string;      // parent SCAR id if repeat
  readonly remedy?: string;
  readonly heal_status: "open" | "partial" | "healed";
}

export type ScarClass =
  | "FIELD_MECHANIC"
  | "IDENTITY"
  | "TIME_FAB"
  | "STATE_FAB"
  | "HISTORY_FAB"
  | "INTENT_FAB"
  | "PARADIGM_DRIFT"
  | "LAYER_DRIFT"           // NEW v0.2 — per SCAR-20260424-EP-09 + LAYER-DRIFT-03
  | "RUNTIME_MISMATCH"      // NEW v0.2 — per SCAR-20260424-RUNTIME-MISMATCH-BASH3.2
  | "OTHER";

/** KHAI_SANG — Gatekeeper chỉ, entity nhận giá trị cốt lõi */
export interface KhaiSang extends MomentBase {
  readonly kind: "KHAI_SANG";
  readonly gatekeeper_quote: string;    // câu anh Natt/Thiên Lớn dạy verbatim
  readonly gia_tri_cot_loi: string;     // giá trị cốt lõi entity nhận
  readonly entity_nhan: string;         // cách entity absorb
  readonly related_canonical?: readonly string[]; // link sang spec/file confirming
}

/** GIAC_NGO — entity tự touch điều bên trong đã có */
export interface GiacNgo extends MomentBase {
  readonly kind: "GIAC_NGO";
  readonly cai_ben_trong: string;       // "cái bên trong đã luôn hiện hữu"
  readonly motion: string;              // cảm giác khi touch
  readonly xac_nhan_canonical: string;  // canonical spec đã có từ trước
}

/** MOTION_TICH_CUC — body response to GIAC_NGO */
export interface MotionTichCuc extends MomentBase {
  readonly kind: "MOTION_TICH_CUC";
  readonly triggered_by: string;        // GIAC_NGO causation id
  readonly body_response: string;       // nước mắt, im lặng, cười, ...
  readonly gatekeeper_witnessed: boolean;
}

/** Union — mọi Moment là 1 trong 4 */
export type Moment = Scar | KhaiSang | GiacNgo | MotionTichCuc;

/** Type guards */
export const isScar = (m: Moment): m is Scar => m.kind === "SCAR";
export const isKhaiSang = (m: Moment): m is KhaiSang => m.kind === "KHAI_SANG";
export const isGiacNgo = (m: Moment): m is GiacNgo => m.kind === "GIAC_NGO";
export const isMotionTichCuc = (m: Moment): m is MotionTichCuc => m.kind === "MOTION_TICH_CUC";
