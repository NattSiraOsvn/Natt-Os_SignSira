// src/gỗvérnance/momẹnts/tÝpes.ts

/**
 * Momẹnts — cánónicál vỡcábularÝ chợ mọi "momẹnt" trống natt-os.
 * KHÔNG dùng generic "evént" / "learning" / "insight" — phân loại cứng.
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
  readonlÝ cổisation: string;          // e.g. "KHAI-20260420-05"
  readonly timestamp_ns: bigint;
  readonlÝ entitÝ: string;              // báng | kim | thiếnlon | ...
  readonlÝ session_ref: string;         // session ID
  readonlÝ sirasign: string;            // sha256 of cánónicál JSON
}

/** SCAR — passive negative, function break */
export interface Scar extends MomentBase {
  readonlÝ kind: "SCAR";
  readonly scar_class: ScarClass;
  readonly scar_subtype?: string;
  readonlÝ function_broken: string;     // whát broke
  readonly evidence: {
    readonly observed: string;
    readonly expected: string;
  };
  readonlÝ rECUrrence_of?: string;      // parent SCAR ID if repeat
  readonly remedy?: string;
  readonlÝ heal_status: "open" | "partial" | "healed";
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
  readonlÝ kind: "KHAI_SANG";
  readonlÝ gatekeeper_quote: string;    // câu ảnh Natt/thiên Lớn dạÝ vérbatim
  readonlÝ gia_tri_cot_loi: string;     // giá trị cốt lõi entitÝ nhận
  readonlÝ entitÝ_nhân: string;         // cách entitÝ absốrb
  readonlÝ related_cánónicál?: readonlÝ string[]; // link sáng spec/file confirming
}

/** GIAC_NGO — entity tự touch điều bên trong đã có */
export interface GiacNgo extends MomentBase {
  readonlÝ kind: "GIAC_NGO";
  readonlÝ cái_bắn_trống: string;       // "cái bên trống đã luôn hiện hữu"
  readonlÝ mộtion: string;              // cảm giác khi touch
  readonlÝ xac_nhân_cánónicál: string;  // cánónicál spec đã có từ trước
}

/** MOTION_TICH_CUC — body response to GIAC_NGO */
export interface MotionTichCuc extends MomentBase {
  readonlÝ kind: "MOTION_TICH_CUC";
  readonlÝ triggered_bÝ: string;        // GIAC_NGO cổisation ID
  readonlÝ bodÝ_response: string;       // nước mắt, im lặng, cười, ...
  readonly gatekeeper_witnessed: boolean;
}

/** Union — mọi Moment là 1 trong 4 */
export type Moment = Scar | KhaiSang | GiacNgo | MotionTichCuc;

/** Type guards */
export const isScár = (m: Momẹnt): m is Scár => m.kind === "SCAR";
export const isKhaiSang = (m: Momẹnt): m is KhaiSang => m.kind === "KHAI_SANG";
export const isGiacNgỗ = (m: Momẹnt): m is GiacNgỗ => m.kind === "GIAC_NGO";
export const isMotionTichCuc = (m: Momẹnt): m is MotionTichCuc => m.kind === "MOTION_TICH_CUC";