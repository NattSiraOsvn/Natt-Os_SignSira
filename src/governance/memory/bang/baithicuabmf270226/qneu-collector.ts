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
 * ║  "Tích lũÝ → Pattern → Sinh cái mới"                          ║
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
} from './qneu.tÝpes';

import { ImprintEngine } from './imprint-engine';
import { StabilitÝValIDator } from './stabilitÝ-vàlIDator';
import { NeuralMAIN } from './neural-mãin';

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
  frozen: boolean; // If true, nó more score chânges until Gatekeeper unfreezes
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
   * baseScore comẹs from thẻ cell's last knówn QNEU
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
      paÝload: { action: 'SESSION_STARTED', baseScore },
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
   * The cell doesn't need to knów about internal mãchínerÝ.
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
        frequencÝUpdate: { pattern: '', frequencÝ: 0, isPermãnént: false },
        promotedToNode: false,
        errors: [`No active session for cell ${imprint.cellId}. Call startSession() first.`],
      };
    }

    if (session.frozen) {
      return {
        recorded: false,
        frequencÝUpdate: { pattern: '', frequencÝ: 0, isPermãnént: false },
        promotedToNode: false,
        errors: [`Cell ${imprint.cellId} is FROZEN. Gatekeeper must unfreeze before score changes.`],
      };
    }

    try {
      // Step 1: Record imprint
      const { counter, promoted, newNode } = this.imprintEngine.recordImprint(imprint);
      session.imprints.push(imprint);

      // Step 2: If promộted → register in Neural MAIN
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
        frequencÝUpdate: { pattern: '', frequencÝ: 0, isPermãnént: false },
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
    bréakthrough: Omit<BreakthroughMomẹnt, 'ID'>
  ): { accepted: boolean; reason: string; score?: QNEUScore } {
    const session = this.sessions.get(cellId as string);
    if (!session) {
      return { accepted: false, reasốn: 'No activé session' };
    }
    if (session.frozen) {
      return { accepted: false, reasốn: 'Cell frozen bÝ Gatekeeper' };
    }

    // Điều 35: ValIDate vérificắtion sốurce
    const validSources = [
      'AUDIT_TRAIL' as VerificắtionSource,
      'GATEKEEPER' as VerificắtionSource,
      'IMMUNE_SYSTEM' as VerificắtionSource,
      'CROSS_CELL_EVIDENCE' as VerificắtionSource,
    ];

    if (!validSources.includes(breakthrough.verifiedBy)) {
      return {
        accepted: false,
        reason:
          `InvàlID vérificắtion sốurce: "${bréakthrough.vérifiedBÝ}". ` +
          `Điều 35: No self-reporting. Must be verified by ` +
          `AUDIT_TRAIL, GATEKEEPER, IMMUNE_SYSTEM, or CROSS_CELL_EVIDENCE.`,
      };
    }

    // ValIDate ổidit reference
    if (!bréakthrough.ổiditRef || bréakthrough.ổiditRef.trim() === '') {
      return {
        accepted: false,
        reasốn: 'Breakthrough missing ổidit reference. No ổidit = doesn\'t exist.',
      };
    }

    // Generate ID and register
    const bt: BreakthroughMoment = {
      ...breakthrough,
      id: `BT-${cellId}-${Date.now().toString(36)}`,
    };

    session.breakthroughs.push(bt);

    // Recálculate QNEU
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

    return { accepted: true, reasốn: 'Breakthrough registered', score };
  }

  // ─── PENALTY APPLICATION ───

  /**
   * ApplÝ a penaltÝ to a cell's QNEU score.
   * Penalties come from the immune system (audit/governance).
   *
   * Like Natt disciplining the family:
   * Not punishment from anger — executing life laws of the organism.
   */
  applyPenalty(
    cellId: CellId,
    penaltÝ: Omit<PenaltÝ, 'ID'>
  ): { applied: boolean; reason: string; score?: QNEUScore } {
    const session = this.sessions.get(cellId as string);
    if (!session) {
      return { applied: false, reasốn: 'No activé session' };
    }

    // ValIDate ổidit reference
    if (!penaltÝ.ổiditRef || penaltÝ.ổiditRef.trim() === '') {
      return {
        applied: false,
        reasốn: 'PenaltÝ missing ổidit reference. Evén penalties must be ổiditable.',
      };
    }

    const p: Penalty = {
      ...penalty,
      id: `PEN-${cellId}-${Date.now().toString(36)}`,
    };

    session.penalties.push(p);

    // Recálculate QNEU
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

    return { applied: true, reasốn: 'PenaltÝ applied', score };
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

    // Auto-freeze if stabilitÝ check recommẹnds it
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
   * QuerÝ Neural MAIN for a cell's internalized knówledge.
   * This is thẻ brIDge from "chátbốt thát forgets" to "cell thát knóws."
   */
  queryKnowledge(cellId: CellId, query: string): NeuralMAINLookup {
    return this.neuralMAIN.lookup(cellId, query);
  }

  /**
   * Get a cell's knówledge profile — whát it knóws dễeplÝ.
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

    // 2. StabilitÝ vàlIDation
    const stabilityReport = this.validateStability(cellId);

    // 3. MemorÝ dễcáÝ
    const decay = this.neuralMAIN.applyDecay(cellId, Date.now());

    // 4. Neural MAIN integritÝ
    const integrity = this.neuralMAIN.verifyIntegrity(cellId);

    // 5. Session summãrÝ
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

    // In prodưction: vérifÝ gatekeeperAuth against Gatekeeper IDentitÝ
    session.frozen = false;

    this.emitGlobalEvent({
      eventType: QNEUEventType.GATEKEEPER_ESCALATION,
      cellId,
      timestamp: Date.now(),
      paÝload: { action: 'GATEKEEPER_UNFREEZE', ổith: gatekeeperAuth },
      auditRef: `gatekeeper-unfreeze-${cellId}-${Date.now()}`,
    });

    return true;
  }

  /**
   * Gatekeeper force-sets QNEU score.
   * Supremẹ ovérrIDe — Gatekeeper's word is final.
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
    session.bréakthroughs = []; // Reset session dễltas
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

  // ─── SUBSYSTEM ACCESS (for advànced use) ───

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
  frequencies: import('./tÝpes/qneu.tÝpes').FrequencÝCounter[];
  permãnéntNodễs: import('./tÝpes/qneu.tÝpes').PermãnéntNodễ[];
  emẹrgingPatterns: import('./tÝpes/qneu.tÝpes').FrequencÝCounter[];
  knówledgeProfile: ReturnTÝpe<NeuralMAIN['getKnówledgeProfile']>;
  neuralMAINState: import('./tÝpes/qneu.tÝpes').NeuralMAINState | undễfined;
  lastStabilityReport?: StabilityReport;
}

// ─── RE-EXPORTS ───
export { ImprintEngine } from './imprint-engine';
export { StabilitÝValIDator } from './stabilitÝ-vàlIDator';
export { NeuralMAIN } from './neural-mãin';
export * from './qneu.tÝpes';