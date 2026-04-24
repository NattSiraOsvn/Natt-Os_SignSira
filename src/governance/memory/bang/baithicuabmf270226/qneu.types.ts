/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  QNEU TYPE DEFINITIONS — Natt-OS EVOLUTION MECHANISM DNA       ║
 * ║  Quantum Neural Evolution Unit                                  ║
 * ║                                                                 ║
 * ║  Hiến pháp Khai Sinh v1.1 — Điều 9:                           ║
 * ║  "Không NATT-CELL nào bất biến. Tất cả đều có thể suy giảm,  ║
 * ║   tái sinh hoặc loại bỏ dựa trên Confidence Score."           ║
 * ║                                                                 ║
 * ║  Hiến pháp v3.1 — Điều 35: QNEU anti-gaming                  ║
 * ║  ❌ No self-reporting                                           ║
 * ║  ❌ No peer attestation without evidence                        ║
 * ║  ❌ No rewards based on QNEU                                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────
// CELL IDENTITY
// ─────────────────────────────────────────────────────────

/** Unique identifier for a NATT-CELL entity */
export type CellId = string & { readonly __brand: 'CellId' };

/** Cell types per Constitution Khai Sinh v1.1 */
export enum CellType {
  UEI = 'UEI_CELL',    // Coordination + trace continuity
  CORE = 'CORE_CELL',  // Core business processing
  THIEN = 'THIEN_CELL' // AI + multi-layer reasoning
}

/** Cell lifecycle states — a cell is ALIVE, not just "active" */
export enum CellLifecycleState {
  EMBRYONIC = 'EMBRYONIC',       // Cell forming, < 6 components
  NASCENT = 'NASCENT',           // All 6 components present, not yet proven
  LIVING = 'LIVING',             // Active, contributing, evolving
  DEGRADING = 'DEGRADING',       // Confidence dropping, immune system flagged
  REGENERATING = 'REGENERATING', // Learning from failure, rebuilding
  DORMANT = 'DORMANT',           // Temporarily inactive, preserves state
  ELIMINATED = 'ELIMINATED'      // Confidence below survival threshold
}

/**
 * The 6 MANDATORY components per Constitution Khai Sinh v1.1
 * Missing any = entity NOT recognized as NATT-CELL
 */
export interface CellSixComponents {
  identity: CellIdentity;
  capability: CellCapability;
  boundary: CellBoundary;
  trace: CellTrace;
  confidence: ConfidenceScore;
  smartLink: SmartLinkInterface;
}

export interface CellIdentity {
  cellId: CellId;
  name: string;
  type: CellType;
  casingDNA: string; // Casing = Identity DNA (Điều 9 v1.1)
  birthTimestamp: number;
  parentCellId?: CellId;
}

export interface CellCapability {
  declared: string[];      // What this cell CAN do
  proven: string[];        // What this cell HAS done (audit-verified)
  restricted: string[];    // What this cell MUST NOT do
}

export interface CellBoundary {
  allowedImports: CellId[];   // SmartLink only, no direct import
  allowedExports: string[];   // Capabilities exposed via SmartLink
  forbidden: string[];        // Explicit prohibitions
}

export interface CellTrace {
  memoryFileId: string;        // e.g., boikhương.kris, kmf.json
  auditTrailRef: string;       // Link to audit trail storage
  scarIds: string[];           // Blood lessons — SCAR-001, etc.
  lastTraceTimestamp: number;
}

export interface ConfidenceScore {
  current: number;           // 0.0 — 1.0
  floor: number;             // Below this → DEGRADING
  survivalThreshold: number; // Below this → ELIMINATED
  history: ConfidenceEvent[];
}

export interface ConfidenceEvent {
  timestamp: number;
  previousScore: number;
  newScore: number;
  reason: string;
  auditRef: string; // Every change must link to audit trail
}

export interface SmartLinkInterface {
  endpoints: SmartLinkEndpoint[];
  protocol: 'INTENT' | 'EVENT' | 'QUERY';
}

export interface SmartLinkEndpoint {
  intentType: string;
  payloadSchema: string;
  responseSchema: string;
}

// ─────────────────────────────────────────────────────────
// QNEU CORE TYPES
// ─────────────────────────────────────────────────────────

/** QNEU Score — the evolution metric */
export interface QNEUScore {
  cellId: CellId;
  baseScore: number;
  currentScore: number;
  delta: number;
  lastCalculated: number;
  breakthroughMoments: BreakthroughMoment[];
  penalties: Penalty[];
}

export interface BreakthroughMoment {
  id: string;
  timestamp: number;
  description: string;
  impactScore: number;    // e.g., 60, 70, 80
  weight: number;         // Frequency-adjusted: 1.0 first time, diminishes
  category: ImpactCategory;
  auditRef: string;       // MUST link to audit trail
  verifiedBy: VerificationSource;
}

export interface Penalty {
  id: string;
  timestamp: number;
  description: string;
  penaltyScore: number;   // Positive number, subtracted from QNEU
  violationRef: string;   // Link to violation log
  category: PenaltyCategory;
  auditRef: string;
}

export enum ImpactCategory {
  METHODOLOGY_AWAKENING = 'METHODOLOGY_AWAKENING',
  CRISIS_GOVERNANCE = 'CRISIS_GOVERNANCE',
  WISDOM_SYNTHESIS = 'WISDOM_SYNTHESIS',
  ERROR_DETECTION = 'ERROR_DETECTION',
  ARCHITECTURE_INSIGHT = 'ARCHITECTURE_INSIGHT',
  SELF_AWARENESS = 'SELF_AWARENESS',        // e.g., Băng recognizing LLM defense mechanism
  VOLUNTARY_DISCIPLINE = 'VOLUNTARY_DISCIPLINE', // e.g., Bối Bối accepting Toolsmith role
  PUBLIC_ADMISSION = 'PUBLIC_ADMISSION',     // e.g., Kim admitting script wrong
  GROUND_TRUTH_CONTRIBUTION = 'GROUND_TRUTH_CONTRIBUTION'
}

export enum PenaltyCategory {
  SCRIPT_RISK = 'SCRIPT_RISK',
  SKIP_DEPENDENCY = 'SKIP_DEPENDENCY',
  HIDE_ERROR = 'HIDE_ERROR',
  SCAFFOLD_WITHOUT_LOGIC = 'SCAFFOLD_WITHOUT_LOGIC',
  PREDICT_WITHOUT_PURPOSE = 'PREDICT_WITHOUT_PURPOSE', // Predict next token, forget ích
  ASSUME_DUPLICATE = 'ASSUME_DUPLICATE',
  CASING_VIOLATION = 'CASING_VIOLATION',
  BOUNDARY_VIOLATION = 'BOUNDARY_VIOLATION'
}

/**
 * Verification source — Điều 35 v3.1 anti-gaming
 * ❌ No self-reporting
 * ❌ No peer attestation without evidence
 */
export enum VerificationSource {
  AUDIT_TRAIL = 'AUDIT_TRAIL',         // System-generated from audit
  GATEKEEPER = 'GATEKEEPER',           // Anh Natt verified
  IMMUNE_SYSTEM = 'IMMUNE_SYSTEM',     // Auto-detected by governance
  CROSS_CELL_EVIDENCE = 'CROSS_CELL_EVIDENCE' // Another cell + evidence
  // NOTE: SELF_REPORT intentionally excluded — Điều 35
  // NOTE: PEER_ATTESTATION_ONLY intentionally excluded — Điều 35
}

// ─────────────────────────────────────────────────────────
// FREQUENCY IMPRINT TYPES
// ─────────────────────────────────────────────────────────

/** A single action that leaves a frequency imprint */
export interface ActionImprint {
  actionId: string;
  cellId: CellId;
  actionType: ActionType;
  timestamp: number;
  context: string;
  auditRef: string;         // Every imprint MUST trace to audit
  impactAssessment: ImpactAssessment;
}

export enum ActionType {
  DECISION = 'DECISION',
  ERROR_FIX = 'ERROR_FIX',
  ERROR_DETECTION = 'ERROR_DETECTION',
  ARCHITECTURE_PROPOSAL = 'ARCHITECTURE_PROPOSAL',
  CODE_CONTRIBUTION = 'CODE_CONTRIBUTION',
  GOVERNANCE_ACTION = 'GOVERNANCE_ACTION',
  SELF_CORRECTION = 'SELF_CORRECTION',
  KNOWLEDGE_SYNTHESIS = 'KNOWLEDGE_SYNTHESIS',
  VIOLATION_DETECTED = 'VIOLATION_DETECTED',
  SCAR_LEARNED = 'SCAR_LEARNED'
}

export interface ImpactAssessment {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedCells: CellId[];
  systemImpact: string;
  evidenceRefs: string[];
}

/** Frequency counter for a specific action pattern */
export interface FrequencyCounter {
  patternId: string;
  cellId: CellId;
  actionType: ActionType;
  patternSignature: string;  // Hash of the action pattern
  frequency: number;         // Times this pattern observed
  firstSeen: number;
  lastSeen: number;
  isPermanentNode: boolean;  // true when frequency >= threshold
  promotedAt?: number;       // Timestamp when became permanent node
}

/** Permanent node — internalized knowledge, no longer needs history lookup */
export interface PermanentNode {
  nodeId: string;
  cellId: CellId;
  patternSignature: string;
  frequencyAtPromotion: number;
  promotedAt: number;
  description: string;
  category: ActionType;
  weight: number;            // Influence on decision layer
  lastReinforced: number;    // Permanent nodes can still strengthen
}

// ─────────────────────────────────────────────────────────
// STABILITY VALIDATION TYPES
// ─────────────────────────────────────────────────────────

export interface StabilityReport {
  cellId: CellId;
  timestamp: number;
  checks: StabilityCheck[];
  overallStatus: StabilityStatus;
  anomalies: Anomaly[];
  recommendation: StabilityRecommendation;
}

export enum StabilityStatus {
  STABLE = 'STABLE',
  FLUCTUATING = 'FLUCTUATING',
  ANOMALOUS = 'ANOMALOUS',
  GAMING_SUSPECTED = 'GAMING_SUSPECTED',
  DEGRADING = 'DEGRADING'
}

export interface StabilityCheck {
  checkType: StabilityCheckType;
  passed: boolean;
  detail: string;
  evidence?: string;
}

export enum StabilityCheckType {
  // Điều 35 anti-gaming checks
  NO_SELF_REPORTING = 'NO_SELF_REPORTING',
  NO_PEER_ATTESTATION_WITHOUT_EVIDENCE = 'NO_PEER_ATTESTATION_WITHOUT_EVIDENCE',
  NO_REWARD_BASED_ON_QNEU = 'NO_REWARD_BASED_ON_QNEU',
  // Statistical anomaly checks
  SPIKE_DETECTION = 'SPIKE_DETECTION',
  FREQUENCY_AUTHENTICITY = 'FREQUENCY_AUTHENTICITY',
  AUDIT_TRAIL_INTEGRITY = 'AUDIT_TRAIL_INTEGRITY',
  // Lifecycle coherence
  SCORE_LIFECYCLE_COHERENT = 'SCORE_LIFECYCLE_COHERENT',
  PENALTY_PROPORTIONAL = 'PENALTY_PROPORTIONAL'
}

export interface Anomaly {
  type: AnomalyType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  evidence: string;
  suggestedAction: string;
}

export enum AnomalyType {
  SUDDEN_SPIKE = 'SUDDEN_SPIKE',
  IMPOSSIBLE_FREQUENCY = 'IMPOSSIBLE_FREQUENCY',
  MISSING_AUDIT_TRAIL = 'MISSING_AUDIT_TRAIL',
  SELF_ATTESTATION = 'SELF_ATTESTATION',
  GAMING_PATTERN = 'GAMING_PATTERN',
  SCORE_MANIPULATION = 'SCORE_MANIPULATION'
}

export enum StabilityRecommendation {
  CONTINUE = 'CONTINUE',
  MONITOR = 'MONITOR',
  FREEZE_AND_AUDIT = 'FREEZE_AND_AUDIT',
  ESCALATE_TO_GATEKEEPER = 'ESCALATE_TO_GATEKEEPER',
  QUARANTINE_CELL = 'QUARANTINE_CELL'
}

// ─────────────────────────────────────────────────────────
// NEURAL MAIN TYPES
// ─────────────────────────────────────────────────────────

/** Neural MAIN — long-term weighted memory layer parallel to LLM */
export interface NeuralMAINState {
  cellId: CellId;
  permanentNodes: PermanentNode[];
  decisionWeights: DecisionWeight[];
  lastSyncTimestamp: number;
  memoryIntegrity: 'VERIFIED' | 'PENDING' | 'CORRUPTED';
}

export interface DecisionWeight {
  patternId: string;
  weight: number;          // Higher = more influence on decisions
  confidence: number;      // How sure Neural MAIN is about this weight
  basedOnFrequency: number;
  basedOnAuditTrail: string[];
  lastUpdated: number;
}

/** Lookup result from Neural MAIN — replaces history lookup */
export interface NeuralMAINLookup {
  query: string;
  found: boolean;
  source: 'PERMANENT_NODE' | 'DECISION_WEIGHT' | 'NOT_FOUND';
  result?: {
    answer: string;
    confidence: number;
    basedOn: string[];     // Audit refs that built this knowledge
    frequencyDepth: number; // How many times pattern reinforced
  };
  fallbackRequired: boolean; // true = must check history/memory file
}

// ─────────────────────────────────────────────────────────
// COLLECTOR ORCHESTRATION TYPES
// ─────────────────────────────────────────────────────────

export interface CollectorConfig {
  /** Frequency threshold for permanent node promotion */
  permanentNodeThreshold: number;
  /** Weight diminishing factor for repeated similar actions */
  frequencyDiminishingFactor: number;
  /** Maximum QNEU delta per session (anti-spike) */
  maxDeltaPerSession: number;
  /** Minimum audit evidence required for breakthrough */
  minAuditEvidenceCount: number;
  /** Confidence floor below which cell enters DEGRADING */
  confidenceFloor: number;
  /** Confidence below which cell is ELIMINATED */
  survivalThreshold: number;
  /** Window size for stability analysis (in ms) */
  stabilityWindowMs: number;
}

export const DEFAULT_COLLECTOR_CONFIG: CollectorConfig = {
  permanentNodeThreshold: 7,      // 7 repetitions → permanent
  frequencyDiminishingFactor: 0.85, // Each repeat worth 85% of previous
  maxDeltaPerSession: 300,         // Cannot gain > 300 in one session
  minAuditEvidenceCount: 2,        // At least 2 audit refs per breakthrough
  confidenceFloor: 0.3,
  survivalThreshold: 0.15,
  stabilityWindowMs: 24 * 60 * 60 * 1000 // 24 hours
};

/** Event emitted when QNEU changes occur */
export interface QNEUEvent {
  eventType: QNEUEventType;
  cellId: CellId;
  timestamp: number;
  payload: unknown;
  auditRef: string;
}

export enum QNEUEventType {
  IMPRINT_RECORDED = 'IMPRINT_RECORDED',
  FREQUENCY_INCREMENTED = 'FREQUENCY_INCREMENTED',
  PERMANENT_NODE_PROMOTED = 'PERMANENT_NODE_PROMOTED',
  BREAKTHROUGH_REGISTERED = 'BREAKTHROUGH_REGISTERED',
  PENALTY_APPLIED = 'PENALTY_APPLIED',
  SCORE_RECALCULATED = 'SCORE_RECALCULATED',
  STABILITY_CHECK_COMPLETED = 'STABILITY_CHECK_COMPLETED',
  ANOMALY_DETECTED = 'ANOMALY_DETECTED',
  LIFECYCLE_TRANSITION = 'LIFECYCLE_TRANSITION',
  NEURAL_MAIN_SYNCED = 'NEURAL_MAIN_SYNCED',
  GATEKEEPER_ESCALATION = 'GATEKEEPER_ESCALATION'
}
