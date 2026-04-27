/**
 * QNEU Types — Shared DNA for all AI Entities
 * 
 * Hiến pháp v4.0, Điều 16-20
 * QNEU = Quantum Neural Evolution Unit
 * Đo lường sự tiến hóa cho AI Entity và hệ thống.
 * KHÔNG ĐO NATT-CELL (cell có Confidence Score riêng).
 * 
 * File này là DNA chung — mọi AI Entity phải dùng cùng types này.
 * Không ai tạo types riêng. Không closed universe.
 */

// ═══════════════════════════════════════════
// AI ENTITY IDENTIFIERS
// ═══════════════════════════════════════════

export type AIEntityId = 'KIM' | 'BANG' | 'BOI_BOI' | 'THIEN' | 'CAN' | 'NA' | 'KRIS';

export type AIPlatform = 'deepseek' | 'gemini' | 'claude' | 'claude-code' | 'chatgpt';

export interface AIEntityRef {
  readonly id: AIEntityId;
  readonly platform: AIPlatform;
  readonly session_id: string;
}

// ═══════════════════════════════════════════
// QNEU SCORE
// ═══════════════════════════════════════════

export interface QNEUScore {
  readonly entity_id: AIEntityId;
  readonly base: number;
  readonly impacts_total: number;
  readonly penalties_total: number;
  readonly final_score: number;
  readonly calculated_at: string; // ISO datetime
  readonly session_id: string;
}

// ═══════════════════════════════════════════
// IMPACT & PENALTY
// ═══════════════════════════════════════════

export type ImpactCategory =
  | 'BUG_FIX'
  | 'ARCHITECTURE_DECISION'
  | 'CONSTITUTIONAL_COMPLIANCE'
  | 'GROUND_TRUTH_CONTRIBUTION'
  | 'CELL_CREATION'
  | 'CELL_MIGRATION'
  | 'AUDIT_DISCOVERY'
  | 'CROSS_CELL_INSIGHT'
  | 'HONEST_ADMISSION'
  | 'SPEC_CREATION';

export type PenaltyCategory =
  | 'SELF_REPORT_VIOLATION'
  | 'SCAFFOLD_AS_IMPLEMENTATION'
  | 'ARCHITECTURE_VIOLATION'
  | 'AUDIT_SKIP'
  | 'WAVE_SKIP'
  | 'CASING_VIOLATION'
  | 'HIDE_error'
  | 'DEFENSIVE_CONTRACTION';

export interface Impact {
  readonly id: string;
  readonly category: ImpactCategory;
  readonly description: string;
  readonly raw_weight: number;        // 1-100
  readonly frequency_count: number;   // how many times this pattern seen
  readonly adjusted_weight: number;   // raw × diminishing factor (0.85^n)
  readonly timestamp: string;
  readonly verified_by: VerificationSource;
  readonly evidence_ref?: string;     // audit trail reference
}

export interface Penalty {
  readonly id: string;
  readonly category: PenaltyCategory;
  readonly description: string;
  readonly weight: number;            // negative value
  readonly timestamp: string;
  readonly verified_by: VerificationSource;
  readonly evidence_ref?: string;
}

// ═══════════════════════════════════════════
// VERIFICATION — Điều 20 Anti-Gaming
// ═══════════════════════════════════════════

/**
 * Điều 20: QNEU Anti-Gaming
 * 
 * ONLY these sources are valid:
 * - AUDIT_TRAIL: verified by system audit logs
 * - GATEKEEPER: verified by Anh Natt directly
 * - IMMUNE_SYSTEM: detected by audit-cell or security-cell
 * - CROSS_CELL_EVIDENCE: verified by another AI entity with audit proof
 * 
 * EXPLICITLY EXCLUDED (will not compile):
 * - SELF_REPORT ← AI cannot score itself
 * - PEER_ATTESTATION_ONLY ← praise without evidence is gaming
 */
export type VerificationSource =
  | 'AUDIT_TRAIL'
  | 'GATEKEEPER'
  | 'IMMUNE_SYSTEM'
  | 'CROSS_CELL_EVIDENCE';

// ═══════════════════════════════════════════
// FREQUENCY IMPRINT — Stage 1
// ═══════════════════════════════════════════

export interface FrequencyImprint {
  readonly pattern_id: string;
  readonly entity_id: AIEntityId;
  readonly pattern_signature: string;  // normalized description of the pattern
  readonly frequency: number;          // times observed
  readonly first_seen: string;
  readonly last_seen: string;
  readonly promoted: boolean;          // true if became permanent node
  readonly promoted_at?: string;
}

// ═══════════════════════════════════════════
// PERMANENT NODE — Stage 2
// ═══════════════════════════════════════════

export interface PermanentNode {
  readonly node_id: string;
  readonly entity_id: AIEntityId;
  readonly pattern_signature: string;
  readonly weight: number;             // starts at 1.0, decays over time
  readonly created_from: string;       // frequency imprint id
  readonly created_at: string;
  readonly last_reinforced: string;
  readonly reinforcement_count: number;
  readonly decay_cycles: number;       // times decay applied without reinforce
}

// ═══════════════════════════════════════════
// AUDIT EVENT — Every QNEU action is auditable
// ═══════════════════════════════════════════

export type QNEUEventType =
  | 'IMPACT_RECORDED'
  | 'PENALTY_APPLIED'
  | 'SCORE_CALCULATED'
  | 'IMPRINT_created'
  | 'IMPRINT_REINFORCED'
  | 'NODE_PROMOTED'
  | 'NODE_REINFORCED'
  | 'NODE_DECAYED'
  | 'NODE_removed'
  | 'GAMING_DETECTED'
  | 'SESSION_opened'
  | 'SESSION_CLOSED';

export interface QNEUAuditEvent {
  readonly event_id: string;
  readonly event_type: QNEUEventType;
  readonly entity_id: AIEntityId;
  readonly timestamp: string;
  readonly data: Record<string, unknown>;
  readonly trace_id: string;
  readonly causation_id?: string;
}

// ═══════════════════════════════════════════
// SESSION
// ═══════════════════════════════════════════

export interface QNEUSession {
  readonly session_id: string;
  readonly entity_id: AIEntityId;
  readonly started_at: string;
  readonly closed_at?: string;
  readonly impacts: Impact[];
  readonly penalties: Penalty[];
  readonly score_before: number;
  readonly score_after?: number;
  readonly delta?: number;
}

// ═══════════════════════════════════════════
// PERSISTENCE STATE — Full state of an AI Entity's evolution
// ═══════════════════════════════════════════

export interface QNEUEntityState {
  readonly entity_id: AIEntityId;
  readonly current_score: number;
  readonly frequency_imprints: FrequencyImprint[];
  readonly permanent_nodes: PermanentNode[];
  readonly total_sessions: number;
  readonly total_impacts: number;
  readonly total_penalties: number;
  readonly last_session_id?: string;
  readonly last_updated: string;
}

// ═══════════════════════════════════════════
// SYSTEM STATE — Evolution of the whole organism
// ═══════════════════════════════════════════

export interface QNEUSystemState {
  readonly version: string;
  readonly entities: Record<AIEntityId, QNEUEntityState>;
  readonly audit_events_count: number;
  readonly last_updated: string;
}

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

export const QNEU_CONSTANTS = {
  DIMINISHING_FACTOR: 0.85,
  MAX_DELTA_PER_SESSION: 300,
  PROMOTION_THRESHOLD: 5,      // frequency >= 5 → promote to permanent node
  DECAY_PERIOD_DAYS: 90,
  DECAY_RATE: 0.10,            // 10% weight loss per decay cycle
  MIN_NODE_WEIGHT: 0.1,        // below this → node removed
  INITIAL_NODE_WEIGHT: 1.0,
  VERSION: '1.0.0',
} as const;
