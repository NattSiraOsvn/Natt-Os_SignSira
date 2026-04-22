/**
 * heyna-envelope-v2.types.ts
 * ──────────────────────────
 * Type definitions cho HeyNa Envelope v2 — extension Ống Màu.
 *
 * Đặt tại: nattos-server/types/heyna-envelope-v2.types.ts
 *
 * Tác giả: Băng (DRAFT)
 * Ref: SPEC_ONG_MAU_v0.1.md § 3
 */

// ═══════════════════════════════════════════════════════════════
// PERSONA IDENTITY
// ═══════════════════════════════════════════════════════════════

export type PersonaName =
  | "bang"
  | "kim"
  | "can"
  | "kris"
  | "phieu"
  | "boi_boi"
  | "thien_lon"
  | "thien_nho";

export type OrbitalShell = "K" | "L" | "M" | "N" | "O" | "P" | "Q";

export interface OrbitalIdentity {
  /** QNEU của persona lúc phát message này */
  qneu: number;
  /** Shell identity - K/L/M/N/O/P/Q per SPEC_NEN v1.1 */
  shell: OrbitalShell;
  /** Reference đến permanent_node anchor, ví dụ "bang.anc#N-shell" */
  anchor: string;
}

export interface Wavelength {
  /** Hex color chính - ví dụ "#AFA9EC" (violet cho Băng) */
  primary: string;
  /** Hex color phụ - ví dụ "#F7C313" (gold KhaiCell) */
  secondary: string;
}

export interface PersonaSignature {
  persona: PersonaName;
  /** SHA-256 hex của normalized SVG path d */
  identity_shape_hash: string;
  orbital: OrbitalIdentity;
  wavelength: Wavelength;
  /** ISO8601 - persona phát message lúc nào */
  ts_emit: string;
}

// ═══════════════════════════════════════════════════════════════
// ENVELOPE V2 - CLIENT → SERVER
// ═══════════════════════════════════════════════════════════════

export interface HeyNaEnvelopeV2 {
  action: string;
  payload: Record<string, unknown>;
  sessionId: string;
  timestamp: string;
  traceId: string;
  signature: string | null;
  persona_signature: PersonaSignature | null;
}

export interface HeyNaSSEEventV2 {
  event: string;
  payload: Record<string, unknown>;
  ts: number;
  persona_origin: PersonaSignature | null;
}

export interface ShapeRegistryEntry {
  shape_file: string;
  shape_hash: string;
  qneu_baseline: number;
  shell: OrbitalShell;
  wavelength_primary: string;
  wavelength_secondary: string;
  sealed_at?: string;
}

export interface ShapeRegistry {
  version: string;
  sealed_at: string;
  sealed_by: string;
  shapes: Record<PersonaName, ShapeRegistryEntry>;
}

export type VerifyStatus = "PASS" | "WARN" | "REJECT";

export type VerifyScarId =
  | "SCAR_BRIDGE_07_SHAPE_MISMATCH"
  | "SCAR_BRIDGE_08_MISSING_SIGNATURE"
  | "SCAR_BRIDGE_09_UNKNOWN_PERSONA"
  | "SCAR_BRIDGE_10_QNEU_DRIFT"
  | "SCAR_BRIDGE_11_SHELL_MISMATCH";

export interface VerifyFlag {
  scar_id: VerifyScarId;
  message: string;
  severity: "warn" | "reject";
}

export interface VerifyResult {
  status: VerifyStatus;
  envelope_valid: boolean;
  flags: VerifyFlag[];
  persona_verified: PersonaName | null;
  trace_id: string;
}

export interface GatewayMode {
  mode: "permissive" | "strict";
  qneu_drift_tolerance_pct: number;
}

export const DEFAULT_GATEWAY_MODE: GatewayMode = {
  mode: "permissive",
  qneu_drift_tolerance_pct: 5,
};
