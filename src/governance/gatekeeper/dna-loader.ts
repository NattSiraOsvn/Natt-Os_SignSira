// @ts-nocheck — TODO: fix type errors, remove this pragma

/**
 * NATT-OS DNA Loader v1.0
 * CAN-01 — Typed constants từ Hiến Pháp v5.0
 *
 * KHÔNG parse markdown. KHÔNG đọc file runtime. KHÔNG dynamic.
 * DNA = compile-time constants — bất biến như Hiến Pháp.
 *
 * Nguồn: src/governance/HIEN-PHAP-NATT-OS-v5.0.md
 */

import { TriggerType, ResponseType } from './trigger-types';

// ── ĐIỀU 3 — 6 thành phần bắt buộc của NATT-CELL ──────────
export const DNA_CELL_COMPONENTS = [
  'Identity',
  'Capability',
  'Boundary',
  'Trace',
  'Confidence',
  'SmartLink',
] as const;

export type CellComponent = typeof DNA_CELL_COMPONENTS[number];

// ── ĐIỀU 4 — Giao tiếp bắt buộc qua EventBus ──────────────
// ── ĐIỀU 6 — Threshold = Cảnh Vệ, weighted signal ─────────
// ── ĐIỀU 7 — Audit bất biến ───────────────────────────────
// ── ĐIỀU 8 — EventBus single source of truth ──────────────
export const DNA_RULES = {
  // Điều 3
  CELL_COMPONENTS_REQUIRED:     6,

  // Điều 4
  DIRECT_IMPORT_FORBIDDEN:      true,
  ALL_EVENTS_THROUGH_EVENTBUS:  true,

  // Điều 5
  QUANTUM_DEFENSE_READS_DNA:    true,
  QUANTUM_DEFENSE_ACTS_INSTANT: true,

  // Điều 6
  THRESHOLD_AGGREGATION:        'weighted_signal' as const,
  THRESHOLD_OWNER:              'quantum-defense-cell' as const,

  // Điều 7
  AUDIT_EVERY_STATE_CHANGE:     true,
  AUDIT_IS_IMMUTABLE:           true,

  // Điều 8
  EVENTBUS_SINGLE_SOURCE:       true,

  // Điều 9
  QNEU_MEASURES_AI_ENTITY:      true,
  QNEU_NOT_MEASURES_CELL:       true,

  // Điều 11
  DNA_CHANGE_REQUIRES_GATEKEEPER: true,
  DNA_TAMPER_RESPONSE:          'OMEGA_LOCK' as const,
} as const;

export type DNARule = keyof typeof DNA_RULES;

// ── TRIGGERS HỢP LỆ — từ TriggerType enum ─────────────────
// Chỉ những trigger này mới được phép đi qua Constitutional Gate
export const DNA_VALID_TRIGGERS = new Set<TriggerType>([
  // Production
  TriggerType.WEIGHT_ANOMALY,
  TriggerType.POLISH_RATE_LOW,
  TriggerType.MATERIAL_LEAK,
  TriggerType.DIAMOND_SUBSTITUTION,
  TriggerType.SC_FLOW_SPIKE,
  // Finance
  TriggerType.CASHFLOW_GAP,
  TriggerType.INVOICE_MISSING,
  TriggerType.BCTC_MISMATCH,
  TriggerType.TAX_EXPOSURE,
  // Security
  TriggerType.AI_UNAUTHORIZED_CALL,
  TriggerType.MULTI_SOURCE_CONFLICT,
  TriggerType.AUDIT_TAMPER_ATTEMPT,
  TriggerType.ROUND_NUMBER_ANOMALY,
  // System
  TriggerType.CELL_HEALTH_DEGRADED,
  TriggerType.SMARTLINK_BROKEN,
  TriggerType.CONSTITUTION_VIOLATED,
]);

// ── RESPONSES HỢP LỆ — từ ResponseType enum ───────────────
export const DNA_VALID_RESPONSES = new Set<ResponseType>([
  ResponseType.EMIT_WARNING,
  ResponseType.EMIT_RISK,
  ResponseType.EMIT_CRITICAL,
  ResponseType.FREEZE_CELL,
  ResponseType.FREEZE_USER,
  ResponseType.ALERT_GATEKEEPER,
  ResponseType.LOG_AUDIT,
  ResponseType.CROSS_VALIDATE,
  ResponseType.ESCALATE_QUANTUM,
]);

// ── OMEGA TRIGGERS — kích hoạt OMEGA_LOCK ngay ────────────
export const DNA_OMEGA_TRIGGERS = new Set<TriggerType>([
  TriggerType.AI_UNAUTHORIZED_CALL,   // LỆNH #001
  TriggerType.AUDIT_TAMPER_ATTEMPT,   // Điều 11
  TriggerType.CONSTITUTION_VIOLATED,  // Điều 11
]);

// ── HELPER ─────────────────────────────────────────────────
export function isValidTrigger(trigger: TriggerType): boolean {
  return DNA_VALID_TRIGGERS.has(trigger);
}

export function isOmegaTrigger(trigger: TriggerType): boolean {
  return DNA_OMEGA_TRIGGERS.has(trigger);
}
