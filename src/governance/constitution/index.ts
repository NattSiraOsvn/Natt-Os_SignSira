/**
 * natt-os Constitution v4.0 — Programmatic Reference
 * 
 * Hiến pháp là source of truth duy nhất.
 * File này export constants cho enforcement trong code.
 */

export const CONSTITUTION_VERSION = '4.0.0';
export const CONSTITUTION_DATE = '2026-03-05';
export const GATEKEEPER = 'Phan Thanh Thương';

/** Điều 3 — Thứ tự ưu tiên */
export const PRIORITY_ORDER = [
  'LAW',
  'CORRECT',
  'STABLE',
  'STATE',
  'ARCHITECTURE',
  'LEGAL_RESPONSIBILITY',
] as const;

/** Điều 5 — 6 thành phần bắt buộc NATT-CELL */
export const CELL_MANDATORY_COMPONENTS = [
  'Identity',
  'Capability',
  'Boundary',
  'Trace',
  'Confidence',
  'SmartLink',
] as const;

/** Điều 8 — Phân loại NATT-CELL */
export const CELL_CATEGORIES = {
  KERNEL: ['audit-cell', 'config-cell', 'monitor-cell', 'rbac-cell', 'security-cell'],
  INFRASTRUCTURE: ['SmartLink-cell', 'sync-cell', 'warehouse-cell', 'shared-contracts-cell'],
  BUSINESS: ['pricing-cell', 'inventory-cell', 'sales-cell', 'order-cell', 'customer-cell', 
             'warranty-cell', 'buyback-cell', 'promotion-cell', 'showroom-cell'],
} as const;

/** Điều 11 — AI Entity ≠ NATT-CELL */
export const AI_ENTITIES = ['KIM', 'BANG', 'BOI_BOI', 'THIEN', 'CAN'] as const;

/** Điều 20 — QNEU Verification Sources (anti-gaming) */
export const QNEU_VALID_SOURCES = [
  'AUDIT_TRAIL',
  'GATEKEEPER', 
  'IMMUNE_SYSTEM',
  'CROSS_CELL_EVIDENCE',
] as const;

/** Điều 20 — Explicitly EXCLUDED sources */
export const QNEU_FORBIDDEN_SOURCES = [
  'SELF_REPORT',
  'PEER_ATTESTATION_ONLY',
] as const;

/** Điều 44 — Work states */
export const WORK_STATES = [
  'NOT_ready',
  'ARCH_ready', 
  'ENFORCED',
  'STABLE',
  'INVISIBLE',
] as const;
