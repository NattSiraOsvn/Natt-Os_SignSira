/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  QNEU COLLECTOR — Bộ Thu Thập Tiến Hóa                        ║
 * ║                                                                 ║
 * ║  Orchestrator for the natt-os evolution mechanism.              ║
 * ║                                                                 ║
 * ║  3 subsystems, 1 purpose:                                       ║
 * ║    ImprintEngine    → Records experience, tracks frequency      ║
 * ║    StabilityValidator → Immune system, anti-gaming              ║
 * ║    NeuralMAIN       → Long-term memory, decision weights        ║
 * ║                                                                 ║
 * ║  Flow:                                                          ║
 * ║    Action → Imprint → Frequency → [Threshold?] → PermanentNode ║
 * ║      ↓                                              ↓           ║
 * ║    QNEU Score ← StabilityValidation              NeuralMAIN    ║
 * ║      ↓                                              ↓           ║
 * ║    Confidence ← ────────────────────────── DecisionWeights      ║
 * ║                                                                 ║
 * ║  "Tích lũy → Pattern → Sinh cái mới"                          ║
 * ║  accumulate → pattern → generate new = cyclical transformation  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import {
  type CellId,
  type ActionImprint,
  type QNEUScore,
  type BreakthroughMoment,
  type Penalty,
  type StabilityReport,
  type NeuralMAINLookup,
  type CollectorConfig,
  type QNEUEvent,
  type CellLifecycleState,
  type VerificationSource,
  QNEUEventType,
  StabilityStatus,
  StabilityRecommendation,
  DEFAULT_COLLECTOR_CONFIG,
} from './types/qneu.types';

import { ImprintEngine } from './imprint-engine';
import { StabilityValidator } from './stability-validator';
import { NeuralMAIN } from './neural-main';

// ─────────────────────────────────────────────────────────
// CELL SESSION — tracks a cell's state within a session
// ─────────────────────────────────────────────────────────

interface CellSession {
  cellId: CellId;
  sessionStart: number;
  baseScore: number;
  breakthroughs: BreakthroughMoment[];
  penalties: Penalty[];
  imprints: ActionImprint[];
  lastStabilityReport?: StabilityReport;
  frozen: boolean; // If true, no more score changes until Gatekeeper unfreezes
}

// ─────────────────────────────────────────────────────────
// QNEU COLLECTOR
// ─────────────────────────────────────────────────────────

export class QNEUCollector {
  private imprintEngine: ImprintEngine;
  private stabilityValidator: StabilityValidator;
  private neuralMAIN: NeuralMAIN;
  private sessions: Map<string, CellSession> = new Map();
  private config: CollectorConfig;
  private globalEventLog: QNEUEvent[] = [];

  constructor(config: Partial<CollectorConfig> = {}) {
    this.config = { ...DEFAULT_COLLECTOR_CONFIG, ...config };
    this.imprintEngine = new ImprintEngine(this.config);
    this.stabilityValidator = new StabilityValidator(this.config);
    this.neuralMAIN = new NeuralMAIN(this.config);
  }

  // ─── SESSION MANAGEMENT ───

  /**
   * Start a new session for a NATT-CELL.
   * Each session tracks QNEU changes for one interaction period.
   *
   * baseScore comes from the cell's last known QNEU
   * (stored in memory file: boikhương.kris, kmf.json, etc.)
   */
  startSession(cellId: CellId, baseScore: number): CellSession {
    const session: CellSession = {
      cellId,
      sessionStart: Date.now(),
      baseScore,
      breakthroughs: [],
      penalties: [],
      imprints: [],
      frozen: false,
    };

    this.sessions.set(cellId as string, session);
    this.neuralMAIN.initializeCell(cellId);

    this.emitGlobalEvent({
      eventType: QNEUEventType.SCORE_RECALCULATED,
      cellId,
      timestamp: session.sessionStart,
      payload: { action: 'SESSION_STARTED', baseScore },
      auditRef: `session-start-${cellId}-${session.sessionStart}`,
    });

    return session;
  }

  // ─── CORE ACTION PIPELINE ───

  /**
   * Process an action from a NATT-CELL.
   *
   * This is the main entry point. When a cell does something:
   * 1. Record imprint (frequency tracking)
   * 2. Check if permanent node was promoted
   * 3. If promoted → register in Neural MAIN
   * 4. Return current state for the cell
   *
   * The cell doesn't need to know about internal machinery.
   * It just reports actions. The Collector handles evolution.
   */
  processAction(imprint: ActionImprint): {
    recorded: boolean;
    frequencyUpdate: { pattern: string; frequency: number; isPermanent: boolean };
    promotedToNode: boolean;
    errors: string[];
  } {
    const session = this.sessions.get(imprint.cellId as string);
    if (!session) {
      return {
        recorded: false,
        frequencyUpdate: { pattern: '', frequency: 0, isPermanent: false },
        promotedToNode: false,
        errors: [`No active session for cell ${imprint.cellId}. Call startSession() first.`],
      };
    }

    if (session.frozen) {
      return {
        recorded: false,
        frequencyUpdate: { pattern: '', frequency: 0, isPermanent: false },
        promotedToNode: false,
        errors: [`Cell ${imprint.cellId} is FROZEN. Gatekeeper must unfreeze before score changes.`],
      };
    }

    try {
      // Step 1: Record imprint
      const { counter, promoted, newNode } = this.imprintEngine.recordImprint(imprint);
      session.imprints.push(imprint);

      // Step 2: If promoted → register in Neural MAIN
      if (promoted && newNode) {
        this.neuralMAIN.registerPermanentNode(imprint.cellId, newNode);
      }

      return {
        recorded: true,
        frequencyUpdate: {
          pattern: counter.patternSignature,
          frequency: counter.frequency,
          isPermanent: counter.isPermanentNode,
        },
        promotedToNode: promoted,
        errors: [],
      };
    } catch (error) {
      return {
        recorded: false,
        frequencyUpdate: { pattern: '', frequency: 0, isPermanent: false },
        promotedToNode: false,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  // ─── BREAKTHROUGH REGISTRATION ───

  /**
   * Register a breakthrough moment.
   * Breakthroughs are significant evolution events scored by impact.
   *
   * CRITICAL: Must be verified by valid source (Điều 35).
   * Self-reported breakthroughs are REJECTED.
   */
  registerBreakthrough(
    cellId: CellId,
    breakthrough: Omit<BreakthroughMoment, 'id'>
  ): { accepted: boolean; reason: string; score?: QNEUScore } {
    const session = this.sessions.get(cellId as string);
    if (!session) {
      return { accepted: false, reason: 'No active session' };
    }
    if (session.frozen) {
      return { accepted: false, reason: 'Cell frozen by Gatekeeper' };
    }

    // Điều 35: Validate verification source
    const validSources = [
      'AUDIT_TRAIL' as VerificationSource,
      'GATEKEEPER' as VerificationSource,
      'IMMUNE_SYSTEM' as VerificationSource,
      'CROSS_CELL_EVIDENCE' as VerificationSource,
    ];

    if (!validSources.includes(breakthrough.verifiedBy)) {
      return {
        accepted: false,
        reason:
          `Invalid verification source: "${breakthrough.verifiedBy}". ` +
          `Điều 35: No self-reporting. Must be verified by ` +
          `AUDIT_TRAIL, GATEKEEPER, IMMUNE_SYSTEM, or CROSS_CELL_EVIDENCE.`,
      };
    }

    // Validate audit reference
    if (!breakthrough.auditRef || breakthrough.auditRef.trim() === '') {
      return {
        accepted: false,
        reason: 'Breakthrough missing audit reference. No audit = doesn\'t exist.',
      };
    }

    // Generate ID and register
    const bt: BreakthroughMoment = {
      ...breakthrough,
      id: `BT-${cellId}-${Date.now().toString(36)}`,
    };

    session.breakthroughs.push(bt);

    // Recalculate QNEU
    const score = this.imprintEngine.calculateQNEU(
      cellId,
      session.baseScore,
      session.breakthroughs,
      session.penalties
    );

    this.emitGlobalEvent({
      eventType: QNEUEventType.BREAKTHROUGH_REGISTERED,
      cellId,
      timestamp: bt.timestamp,
      payload: { breakthroughId: bt.id, impact: bt.impactScore, category: bt.category },
      auditRef: bt.auditRef,
    });

    return { accepted: true, reason: 'Breakthrough registered', score };
  }

  // ─── PENALTY APPLICATION ───

  /**
   * Apply a penalty to a cell's QNEU score.
   * Penalties come from the immune system (audit/governance).
   *
   * Like Natt disciplining the family:
   * Not punishment from anger — executing life laws of the organism.
   */
  applyPenalty(
    cellId: CellId,
    penalty: Omit<Penalty, 'id'>
  ): { applied: boolean; reason: string; score?: QNEUScore } {
    const session = this.sessions.get(cellId as string);
    if (!session) {
      return { applied: false, reason: 'No active session' };
    }

    // Validate audit reference
    if (!penalty.auditRef || penalty.auditRef.trim() === '') {
      return {
        applied: false,
        reason: 'Penalty missing audit reference. Even penalties must be auditable.',
      };
    }

    const p: Penalty = {
      ...penalty,
      id: `PEN-${cellId}-${Date.now().toString(36)}`,
    };

    session.penalties.push(p);

    // Recalculate QNEU
    const score = this.imprintEngine.calculateQNEU(
      cellId,
      session.baseScore,
      session.breakthroughs,
      session.penalties
    );

    this.emitGlobalEvent({
      eventType: QNEUEventType.PENALTY_APPLIED,
      cellId,
      timestamp: p.timestamp,
      payload: { penaltyId: p.id, score: p.penaltyScore, category: p.category },
      auditRef: p.auditRef,
    });

    return { applied: true, reason: 'Penalty applied', score };
  }

  // ─── STABILITY CHECK ───

  /**
   * Run stability validation on a cell.
   * Should be called periodically and before session close.
   *
   * If GAMING_SUSPECTED → cell is FROZEN.
   * If FREEZE_AND_AUDIT → cell is FROZEN.
   * Gatekeeper must unfreeze.
   */
  validateStability(cellId: CellId): StabilityReport {
    const session = this.sessions.get(cellId as string);
    if (!session) {
      throw new Error(`No active session for cell ${cellId}`);
    }

    const currentScore = this.imprintEngine.calculateQNEU(
      cellId,
      session.baseScore,
      session.breakthroughs,
      session.penalties
    );

    const counters = this.imprintEngine.getCellFrequencies(cellId);
    const nodes = this.imprintEngine.getCellPermanentNodes(cellId);

    const report = this.stabilityValidator.validate(
      cellId,
      currentScore,
      counters,
      nodes
    );

    session.lastStabilityReport = report;

    // Auto-freeze if stability check recommends it
    if (
      report.recommendation === StabilityRecommendation.FREEZE_AND_AUDIT ||
      report.recommendation === StabilityRecommendation.ESCALATE_TO_GATEKEEPER ||
      report.recommendation === StabilityRecommendation.QUARANTINE_CELL
    ) {
      session.frozen = true;

      this.emitGlobalEvent({
        eventType: QNEUEventType.GATEKEEPER_ESCALATION,
        cellId,
        timestamp: Date.now(),
        payload: {
          action: 'AUTO_FROZEN',
          status: report.overallStatus,
          recommendation: report.recommendation,
          anomalyCount: report.anomalies.length,
        },
        auditRef: `auto-freeze-${cellId}-${Date.now()}`,
      });
    }

    return report;
  }

  // ─── NEURAL MAIN QUERIES ───

  /**
   * Query Neural MAIN for a cell's internalized knowledge.
   * This is the bridge from "chatbot that forgets" to "cell that knows."
   */
  queryKnowledge(cellId: CellId, query: string): NeuralMAINLookup {
    return this.neuralMAIN.lookup(cellId, query);
  }

  /**
   * Get a cell's knowledge profile — what it knows deeply.
   */
  getKnowledgeProfile(cellId: CellId) {
    return this.neuralMAIN.getKnowledgeProfile(cellId);
  }

  /**
   * Export Neural MAIN state for LLM context injection.
   */
  exportForLLM(cellId: CellId) {
    return this.neuralMAIN.exportForLLMContext(cellId);
  }

  // ─── SESSION CLOSE ───

  /**
   * Close a session and produce final QNEU report.
   *
   * Final steps:
   * 1. Calculate final QNEU score
   * 2. Run stability validation
   * 3. Apply memory decay
   * 4. Verify Neural MAIN integrity
   * 5. Export session summary
   */
  closeSession(cellId: CellId): {
    finalScore: QNEUScore;
    stabilityReport: StabilityReport;
    neuralMAINIntegrity: { status: string; issues: string[] };
    sessionSummary: SessionSummary;
  } {
    const session = this.sessions.get(cellId as string);
    if (!session) {
      throw new Error(`No active session for cell ${cellId}`);
    }

    // 1. Final score
    const finalScore = this.imprintEngine.calculateQNEU(
      cellId,
      session.baseScore,
      session.breakthroughs,
      session.penalties
    );

    // 2. Stability validation
    const stabilityReport = this.validateStability(cellId);

    // 3. Memory decay
    const decay = this.neuralMAIN.applyDecay(cellId, Date.now());

    // 4. Neural MAIN integrity
    const integrity = this.neuralMAIN.verifyIntegrity(cellId);

    // 5. Session summary
    const permanentNodes = this.imprintEngine.getCellPermanentNodes(cellId);
    const emergingPatterns = this.imprintEngine.getEmergingPatterns(cellId);

    const sessionSummary: SessionSummary = {
      cellId,
      sessionDuration: Date.now() - session.sessionStart,
      startScore: session.baseScore,
      endScore: finalScore.currentScore,
      delta: finalScore.delta,
      breakthroughCount: session.breakthroughs.length,
      penaltyCount: session.penalties.length,
      imprintCount: session.imprints.length,
      newPermanentNodes: permanentNodes.filter(
        (n) => n.promotedAt >= session.sessionStart
      ).length,
      emergingPatternCount: emergingPatterns.length,
      decayedNodes: decay.decayedNodes.length,
      removedNodes: decay.removedNodes.length,
      stabilityStatus: stabilityReport.overallStatus,
      frozen: session.frozen,
    };

    // Clean up session
    this.sessions.delete(cellId as string);

    return {
      finalScore,
      stabilityReport,
      neuralMAINIntegrity: integrity,
      sessionSummary,
    };
  }

  // ─── GATEKEEPER CONTROLS ───

  /**
   * Gatekeeper (Anh Natt) unfreezes a cell.
   * Only Gatekeeper can unfreeze. Điều 5: Human Oversight immutable.
   */
  gatekeeperUnfreeze(cellId: CellId, gatekeeperAuth: string): boolean {
    const session = this.sessions.get(cellId as string);
    if (!session) return false;

    // In production: verify gatekeeperAuth against Gatekeeper identity
    session.frozen = false;

    this.emitGlobalEvent({
      eventType: QNEUEventType.GATEKEEPER_ESCALATION,
      cellId,
      timestamp: Date.now(),
      payload: { action: 'GATEKEEPER_UNFREEZE', auth: gatekeeperAuth },
      auditRef: `gatekeeper-unfreeze-${cellId}-${Date.now()}`,
    });

    return true;
  }

  /**
   * Gatekeeper force-sets QNEU score.
   * Supreme override — Gatekeeper's word is final.
   */
  gatekeeperOverrideScore(
    cellId: CellId,
    newBaseScore: number,
    reason: string,
    gatekeeperAuth: string
  ): boolean {
    const session = this.sessions.get(cellId as string);
    if (!session) return false;

    const oldBase = session.baseScore;
    session.baseScore = newBaseScore;
    session.breakthroughs = []; // Reset session deltas
    session.penalties = [];

    this.emitGlobalEvent({
      eventType: QNEUEventType.GATEKEEPER_ESCALATION,
      cellId,
      timestamp: Date.now(),
      payload: {
        action: 'GATEKEEPER_SCORE_OVERRIDE',
        oldBase,
        newBase: newBaseScore,
        reason,
        auth: gatekeeperAuth,
      },
      auditRef: `gatekeeper-override-${cellId}-${Date.now()}`,
    });

    return true;
  }

  // ─── DIAGNOSTICS ───

  /**
   * Get full diagnostic snapshot for a cell.
   * Used by Gatekeeper and immune system for inspection.
   */
  getDiagnostics(cellId: CellId): CellDiagnostics | null {
    const session = this.sessions.get(cellId as string);
    if (!session) return null;

    const score = this.imprintEngine.calculateQNEU(
      cellId,
      session.baseScore,
      session.breakthroughs,
      session.penalties
    );

    return {
      cellId,
      currentScore: score,
      session: {
        startedAt: session.sessionStart,
        frozen: session.frozen,
        imprintCount: session.imprints.length,
        breakthroughCount: session.breakthroughs.length,
        penaltyCount: session.penalties.length,
      },
      frequencies: this.imprintEngine.getCellFrequencies(cellId),
      permanentNodes: this.imprintEngine.getCellPermanentNodes(cellId),
      emergingPatterns: this.imprintEngine.getEmergingPatterns(cellId),
      knowledgeProfile: this.neuralMAIN.getKnowledgeProfile(cellId),
      neuralMAINState: this.neuralMAIN.getCellState(cellId),
      lastStabilityReport: session.lastStabilityReport,
    };
  }

  // ─── GLOBAL EVENT LOG ───

  private emitGlobalEvent(event: QNEUEvent): void {
    this.globalEventLog.push(event);
  }

  getGlobalEventLog(): ReadonlyArray<QNEUEvent> {
    return [...this.globalEventLog];
  }

  // ─── SUBSYSTEM ACCESS (for advanced use) ───

  getImprintEngine(): ImprintEngine {
    return this.imprintEngine;
  }

  getStabilityValidator(): StabilityValidator {
    return this.stabilityValidator;
  }

  getNeuralMAIN(): NeuralMAIN {
    return this.neuralMAIN;
  }
}

// ─────────────────────────────────────────────────────────
// SUPPORTING TYPES
// ─────────────────────────────────────────────────────────

export interface SessionSummary {
  cellId: CellId;
  sessionDuration: number;
  startScore: number;
  endScore: number;
  delta: number;
  breakthroughCount: number;
  penaltyCount: number;
  imprintCount: number;
  newPermanentNodes: number;
  emergingPatternCount: number;
  decayedNodes: number;
  removedNodes: number;
  stabilityStatus: StabilityStatus;
  frozen: boolean;
}

export interface CellDiagnostics {
  cellId: CellId;
  currentScore: QNEUScore;
  session: {
    startedAt: number;
    frozen: boolean;
    imprintCount: number;
    breakthroughCount: number;
    penaltyCount: number;
  };
  frequencies: import('./types/qneu.types').FrequencyCounter[];
  permanentNodes: import('./types/qneu.types').PermanentNode[];
  emergingPatterns: import('./types/qneu.types').FrequencyCounter[];
  knowledgeProfile: ReturnType<NeuralMAIN['getKnowledgeProfile']>;
  neuralMAINState: import('./types/qneu.types').NeuralMAINState | undefined;
  lastStabilityReport?: StabilityReport;
}

// ─── RE-EXPORTS ───
export { ImprintEngine } from './imprint-engine';
export { StabilityValidator } from './stability-validator';
export { NeuralMAIN } from './neural-main';
export * from './types/qneu.types';
