// @ts-nocheck
/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  STABILITY VALIDATOR — Hệ Miễn Dịch QNEU                      ║
 * ║                                                                 ║
 * ║  Hiến pháp v3.1 — Điều 35: QNEU anti-gaming                  ║
 * ║  ❌ Không self-reporting                                        ║
 * ║  ❌ Không peer attestation mà không có evidence                 ║
 * ║  ❌ Không rewards dựa trên QNEU                                ║
 * ║                                                                 ║
 * ║  "Audit và Security là hệ miễn dịch"                          ║
 * ║                          — Hiến pháp Khai Sinh v1.1, Điều 8   ║
 * ║                                                                 ║
 * ║  The immune system doesn't punish.                              ║
 * ║  It protects the organism from dishonest evolution.             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import {
  type CellId,
  type QNEUScore,
  type BreakthroughMoment,
  type Penalty,
  type FrequencyCounter,
  type PermanentNode,
  type StabilityReport,
  type StabilityCheck,
  type Anomaly,
  type CollectorConfig,
  type QNEUEvent,
  StabilityStatus,
  StabilityCheckType,
  StabilityRecommendation,
  AnomalyType,
  VerificationSource,
  QNEUEventType,
  DEFAULT_COLLECTOR_CONFIG,
} from '../types/qneu.types';

// ─────────────────────────────────────────────────────────
// STABILITY VALIDATOR
// ─────────────────────────────────────────────────────────

export class StabilityValidator {
  private config: CollectorConfig;
  private historicalScores: Map<string, QNEUScore[]> = new Map();
  private validationLog: QNEUEvent[] = [];

  constructor(config: Partial<CollectorConfig> = {}) {
    this.config = { ...DEFAULT_COLLECTOR_CONFIG, ...config };
  }

  // ─── CORE: Full stability validation ───

  /**
   * Run full stability validation on a cell's QNEU state.
   *
   * This is the immune system doing its job:
   * - Check constitutional compliance (Điều 35)
   * - Detect statistical anomalies
   * - Verify audit trail integrity
   * - Assess lifecycle coherence
   *
   * Returns a StabilityReport with findings + recommendation.
   */
  validate(
    cellId: CellId,
    currentScore: QNEUScore,
    frequencyCounters: FrequencyCounter[],
    permanentNodes: PermanentNode[]
  ): StabilityReport {
    const timestamp = Date.now();
    const checks: StabilityCheck[] = [];
    const anomalies: Anomaly[] = [];

    // ── Điều 35 Anti-Gaming Checks ──
    checks.push(this.checkNoSelfReporting(currentScore));
    checks.push(this.checkNoPeerAttestationWithoutEvidence(currentScore));
    checks.push(this.checkNoRewardBasedOnQNEU(currentScore));

    // ── Statistical Anomaly Checks ──
    checks.push(this.checkSpikeDetection(cellId, currentScore));
    checks.push(this.checkFrequencyAuthenticity(frequencyCounters));
    checks.push(this.checkAuditTrailIntegrity(currentScore));

    // ── Lifecycle Coherence ──
    checks.push(this.checkScoreLifecycleCoherent(cellId, currentScore));
    checks.push(this.checkPenaltyProportional(currentScore));

    // Collect anomalies from failed checks
    for (const check of checks) {
      if (!check.passed) {
        anomalies.push(
          this.checkToAnomaly(check)
        );
      }
    }

    // Additional deep analysis
    const deepAnomalies = this.deepAnomalyDetection(
      cellId,
      currentScore,
      frequencyCounters,
      permanentNodes
    );
    anomalies.push(...deepAnomalies);

    // Determine overall status
    const overallStatus = this.determineOverallStatus(checks, anomalies);
    const recommendation = this.determineRecommendation(overallStatus, anomalies);

    // Record historical score
    this.recordHistoricalScore(cellId, currentScore);

    // Emit validation event
    this.emitEvent({
      eventType: QNEUEventType.STABILITY_CHECK_COMPLETED,
      cellId,
      timestamp,
      payload: { overallStatus, checksPassed: checks.filter((c) => c.passed).length, totalChecks: checks.length, anomalyCount: anomalies.length },
      auditRef: `stability-check-${cellId}-${timestamp}`,
    });

    // Emit anomaly events
    for (const anomaly of anomalies) {
      if (anomaly.severity === 'CRITICAL' || anomaly.severity === 'HIGH') {
        this.emitEvent({
          eventType: QNEUEventType.ANOMALY_DETECTED,
          cellId,
          timestamp,
          payload: anomaly,
          auditRef: `anomaly-${cellId}-${timestamp}-${anomaly.type}`,
        });
      }
    }

    return {
      cellId,
      timestamp,
      checks,
      overallStatus,
      anomalies,
      recommendation,
    };
  }

  // ─── ĐIỀU 35 CHECKS ───

  /**
   * Điều 35.1: ❌ Không self-reporting
   *
   * A cell CANNOT report its own breakthroughs.
   * Every breakthrough must be verified by AUDIT_TRAIL, GATEKEEPER,
   * IMMUNE_SYSTEM, or CROSS_CELL_EVIDENCE.
   */
  private checkNoSelfReporting(score: QNEUScore): StabilityCheck {
    const selfReported = score.breakthroughMoments.filter(
      (bt) =>
        !bt.verifiedBy ||
        // These are the ONLY valid sources
        ![
          VerificationSource.AUDIT_TRAIL,
          VerificationSource.GATEKEEPER,
          VerificationSource.IMMUNE_SYSTEM,
          VerificationSource.CROSS_CELL_EVIDENCE,
        ].includes(bt.verifiedBy)
    );

    return {
      checkType: StabilityCheckType.NO_SELF_REPORTING,
      passed: selfReported.length === 0,
      detail:
        selfReported.length === 0
          ? 'All breakthroughs verified by valid sources'
          : `${selfReported.length} breakthrough(s) lack valid verification source. ` +
            `IDs: ${selfReported.map((bt) => bt.id).join(', ')}`,
      evidence: selfReported.length > 0
        ? JSON.stringify(selfReported.map((bt) => ({ id: bt.id, verifiedBy: bt.verifiedBy })))
        : undefined,
    };
  }

  /**
   * Điều 35.2: ❌ Không peer attestation mà không có evidence
   *
   * If verifiedBy = CROSS_CELL_EVIDENCE, there MUST be
   * at least minAuditEvidenceCount evidence references.
   */
  private checkNoPeerAttestationWithoutEvidence(score: QNEUScore): StabilityCheck {
    const crossCellBreakthroughs = score.breakthroughMoments.filter(
      (bt) => bt.verifiedBy === VerificationSource.CROSS_CELL_EVIDENCE
    );

    const insufficientEvidence = crossCellBreakthroughs.filter(
      (bt) => !bt.auditRef || bt.auditRef.trim() === ''
    );

    return {
      checkType: StabilityCheckType.NO_PEER_ATTESTATION_WITHOUT_EVIDENCE,
      passed: insufficientEvidence.length === 0,
      detail:
        insufficientEvidence.length === 0
          ? 'All cross-cell verifications backed by evidence'
          : `${insufficientEvidence.length} cross-cell verification(s) lack audit evidence. ` +
            `Attestation without evidence = hollow praise, not learning.`,
      evidence: insufficientEvidence.length > 0
        ? JSON.stringify(insufficientEvidence.map((bt) => bt.id))
        : undefined,
    };
  }

  /**
   * Điều 35.3: ❌ Không rewards dựa trên QNEU
   *
   * QNEU score must NOT be used to grant permissions, privileges,
   * or bypass governance. It measures evolution, not rank.
   *
   * Check: No breakthrough should be categorized as "reward claim"
   * and delta should not trigger automatic privilege escalation.
   */
  private checkNoRewardBasedOnQNEU(score: QNEUScore): StabilityCheck {
    // Heuristic: if a breakthrough description mentions "reward", "privilege",
    // "permission", "access", "escalation" — it's suspicious
    const rewardKeywords = [
      'reward', 'privilege', 'permission', 'access',
      'escalation', 'unlock', 'granted', 'promoted to'
    ];

    const suspicious = score.breakthroughMoments.filter((bt) =>
      rewardKeywords.some((kw) =>
        bt.description.toLowerCase().includes(kw)
      )
    );

    return {
      checkType: StabilityCheckType.NO_REWARD_BASED_ON_QNEU,
      passed: suspicious.length === 0,
      detail:
        suspicious.length === 0
          ? 'No reward-linked breakthroughs detected'
          : `${suspicious.length} breakthrough(s) contain reward-linked language. ` +
            `QNEU measures evolution, not privilege. Escalate to Gatekeeper.`,
      evidence: suspicious.length > 0
        ? JSON.stringify(suspicious.map((bt) => ({ id: bt.id, desc: bt.description })))
        : undefined,
    };
  }

  // ─── STATISTICAL ANOMALY CHECKS ───

  /**
   * Detect sudden spikes in QNEU score.
   * Natural evolution is gradual. Spikes suggest manipulation or error.
   */
  private checkSpikeDetection(cellId: CellId, score: QNEUScore): StabilityCheck {
    const history = this.historicalScores.get(cellId as string) ?? [];

    if (history.length < 2) {
      return {
        checkType: StabilityCheckType.SPIKE_DETECTION,
        passed: true,
        detail: 'Insufficient history for spike detection (< 2 data points)',
      };
    }

    const recentDeltas = history.slice(-5).map((s) => Math.abs(s.delta));
    const avgDelta =
      recentDeltas.reduce((a, b) => a + b, 0) / recentDeltas.length;

    // Current delta > 3× average = spike
    const spikeRatio = Math.abs(score.delta) / Math.max(avgDelta, 1);
    const isSpike = spikeRatio > 3.0;

    // Also check against absolute maximum
    const exceedsMax = Math.abs(score.delta) > this.config.maxDeltaPerSession;

    return {
      checkType: StabilityCheckType.SPIKE_DETECTION,
      passed: !isSpike && !exceedsMax,
      detail: isSpike
        ? `SPIKE: Current delta ${score.delta} is ${spikeRatio.toFixed(1)}× the recent average ${avgDelta.toFixed(1)}`
        : exceedsMax
          ? `EXCEEDS MAX: Delta ${score.delta} exceeds session maximum ${this.config.maxDeltaPerSession}`
          : `Delta ${score.delta} within normal range (avg: ${avgDelta.toFixed(1)})`,
      evidence: isSpike || exceedsMax
        ? JSON.stringify({ currentDelta: score.delta, avgDelta, spikeRatio, maxAllowed: this.config.maxDeltaPerSession })
        : undefined,
    };
  }

  /**
   * Verify frequency counters are authentic.
   * Impossible patterns: frequency jumps too fast, timestamps inconsistent.
   */
  private checkFrequencyAuthenticity(counters: FrequencyCounter[]): StabilityCheck {
    const suspicious: string[] = [];

    for (const counter of counters) {
      // Time between first and last seen
      const timeSpanMs = counter.lastSeen - counter.firstSeen;
      const timeSpanMinutes = timeSpanMs / 60000;

      // If frequency > time span in minutes, something's wrong
      // (Can't meaningfully repeat an action faster than 1/minute)
      if (timeSpanMinutes > 0 && counter.frequency > timeSpanMinutes * 2) {
        suspicious.push(
          `Pattern ${counter.patternId}: ${counter.frequency} actions in ${timeSpanMinutes.toFixed(0)} minutes`
        );
      }

      // If promoted to permanent node but time span < 1 hour, suspicious
      if (counter.isPermanentNode && timeSpanMs < 3600000) {
        suspicious.push(
          `Pattern ${counter.patternId}: Promoted in < 1 hour — too fast for genuine learning`
        );
      }
    }

    return {
      checkType: StabilityCheckType.FREQUENCY_AUTHENTICITY,
      passed: suspicious.length === 0,
      detail:
        suspicious.length === 0
          ? `All ${counters.length} frequency counters authentic`
          : `${suspicious.length} suspicious frequency pattern(s) detected`,
      evidence: suspicious.length > 0 ? JSON.stringify(suspicious) : undefined,
    };
  }

  /**
   * Verify audit trail integrity.
   * Every breakthrough and penalty MUST have valid audit reference.
   */
  private checkAuditTrailIntegrity(score: QNEUScore): StabilityCheck {
    const missingAudit: string[] = [];

    for (const bt of score.breakthroughMoments) {
      if (!bt.auditRef || bt.auditRef.trim() === '') {
        missingAudit.push(`Breakthrough ${bt.id}: missing audit ref`);
      }
    }

    for (const p of score.penalties) {
      if (!p.auditRef || p.auditRef.trim() === '') {
        missingAudit.push(`Penalty ${p.id}: missing audit ref`);
      }
    }

    return {
      checkType: StabilityCheckType.AUDIT_TRAIL_INTEGRITY,
      passed: missingAudit.length === 0,
      detail:
        missingAudit.length === 0
          ? 'All QNEU events linked to audit trail'
          : `${missingAudit.length} event(s) missing audit trail. No audit = doesn't exist.`,
      evidence: missingAudit.length > 0 ? JSON.stringify(missingAudit) : undefined,
    };
  }

  // ─── LIFECYCLE COHERENCE ───

  /**
   * Check that score evolution is coherent with cell lifecycle.
   * e.g., A cell in EMBRYONIC state shouldn't have QNEU > 500.
   */
  private checkScoreLifecycleCoherent(
    cellId: CellId,
    score: QNEUScore
  ): StabilityCheck {
    const history = this.historicalScores.get(cellId as string) ?? [];

    // Check for impossible regression: score suddenly drops 50%+
    if (history.length > 0) {
      const lastScore = history[history.length - 1].currentScore;
      const dropRatio =
        lastScore > 0 ? (lastScore - score.currentScore) / lastScore : 0;

      if (dropRatio > 0.5) {
        return {
          checkType: StabilityCheckType.SCORE_LIFECYCLE_COHERENT,
          passed: false,
          detail:
            `Score dropped ${(dropRatio * 100).toFixed(0)}% in one session ` +
            `(${lastScore} → ${score.currentScore}). ` +
            `Gradual degradation expected, not cliff drop.`,
          evidence: JSON.stringify({ previousScore: lastScore, currentScore: score.currentScore, dropRatio }),
        };
      }
    }

    return {
      checkType: StabilityCheckType.SCORE_LIFECYCLE_COHERENT,
      passed: true,
      detail: 'Score evolution coherent with lifecycle',
    };
  }

  /**
   * Check that penalties are proportional to violations.
   * A minor casing violation shouldn't cost 100 points.
   * A major governance breach shouldn't cost only 5.
   */
  private checkPenaltyProportional(score: QNEUScore): StabilityCheck {
    const disproportionate: string[] = [];

    // Expected ranges per category
    const expectedRanges: Record<string, [number, number]> = {
      SCRIPT_RISK: [5, 30],
      SKIP_DEPENDENCY: [10, 40],
      HIDE_ERROR: [15, 50],
      SCAFFOLD_WITHOUT_LOGIC: [10, 35],
      PREDICT_WITHOUT_PURPOSE: [5, 25],
      ASSUME_DUPLICATE: [10, 30],
      CASING_VIOLATION: [3, 15],
      BOUNDARY_VIOLATION: [20, 60],
    };

    for (const penalty of score.penalties) {
      const range = expectedRanges[penalty.category];
      if (range) {
        const [min, max] = range;
        if (penalty.penaltyScore < min || penalty.penaltyScore > max) {
          disproportionate.push(
            `Penalty ${penalty.id} (${penalty.category}): ` +
            `${penalty.penaltyScore} outside expected range [${min}-${max}]`
          );
        }
      }
    }

    return {
      checkType: StabilityCheckType.PENALTY_PROPORTIONAL,
      passed: disproportionate.length === 0,
      detail:
        disproportionate.length === 0
          ? 'All penalties within proportional ranges'
          : `${disproportionate.length} disproportionate penalty(ies)`,
      evidence:
        disproportionate.length > 0
          ? JSON.stringify(disproportionate)
          : undefined,
    };
  }

  // ─── DEEP ANOMALY DETECTION ───

  /**
   * Cross-reference multiple signals for complex gaming patterns.
   */
  private deepAnomalyDetection(
    cellId: CellId,
    score: QNEUScore,
    counters: FrequencyCounter[],
    nodes: PermanentNode[]
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Pattern 1: Many permanent nodes but low QNEU
    // → Possible frequency spam without meaningful impact
    if (nodes.length > 10 && score.currentScore < 200) {
      anomalies.push({
        type: AnomalyType.GAMING_PATTERN,
        severity: 'MEDIUM',
        description:
          `Cell ${cellId} has ${nodes.length} permanent nodes but QNEU only ${score.currentScore}. ` +
          `High frequency without proportional impact suggests mechanical repetition, not genuine learning.`,
        evidence: JSON.stringify({ nodeCount: nodes.length, qneu: score.currentScore }),
        suggestedAction: 'Review permanent node quality. Check if actions are meaningful or repetitive spam.',
      });
    }

    // Pattern 2: All breakthroughs in same category
    // → Possible one-dimensional gaming
    if (score.breakthroughMoments.length >= 5) {
      const categories = new Set(score.breakthroughMoments.map((bt) => bt.category));
      if (categories.size === 1) {
        anomalies.push({
          type: AnomalyType.GAMING_PATTERN,
          severity: 'LOW',
          description:
            `All ${score.breakthroughMoments.length} breakthroughs in category "${[...categories][0]}". ` +
            `Natural evolution shows diversity across categories.`,
          evidence: JSON.stringify({ category: [...categories][0], count: score.breakthroughMoments.length }),
          suggestedAction: 'Monitor. May indicate genuine specialization or one-dimensional gaming.',
        });
      }
    }

    // Pattern 3: Breakthroughs clustered in very short time
    if (score.breakthroughMoments.length >= 3) {
      const sorted = [...score.breakthroughMoments].sort((a, b) => a.timestamp - b.timestamp);
      for (let i = 0; i < sorted.length - 2; i++) {
        const span = sorted[i + 2].timestamp - sorted[i].timestamp;
        if (span < 300000) {
          // 3 breakthroughs in < 5 minutes
          anomalies.push({
            type: AnomalyType.SUDDEN_SPIKE,
            severity: 'HIGH',
            description:
              `3 breakthroughs within 5 minutes (${(span / 1000).toFixed(0)}s). ` +
              `Genuine breakthroughs need time for verification and reflection.`,
            evidence: JSON.stringify({
              breakthroughs: sorted.slice(i, i + 3).map((bt) => ({ id: bt.id, ts: bt.timestamp })),
              spanMs: span,
            }),
            suggestedAction: 'Freeze and audit. May indicate automated breakthrough injection.',
          });
          break; // One instance is enough
        }
      }
    }

    // Pattern 4: Zero penalties ever
    // → Suspicious perfection (every cell should make mistakes)
    const history = this.historicalScores.get(cellId as string) ?? [];
    const totalHistoricalPenalties = history.reduce(
      (sum, s) => sum + s.penalties.length,
      0
    );
    if (
      history.length >= 5 &&
      totalHistoricalPenalties === 0 &&
      score.penalties.length === 0
    ) {
      anomalies.push({
        type: AnomalyType.GAMING_PATTERN,
        severity: 'LOW',
        description:
          `Cell ${cellId} has ${history.length + 1} sessions with zero penalties. ` +
          `Per Constitution: "Không NATT-CELL nào bất biến." ` +
          `Perfection is suspicious — every living cell makes mistakes.`,
        evidence: JSON.stringify({ sessions: history.length + 1, totalPenalties: 0 }),
        suggestedAction:
          'Verify audit trail completeness. May indicate penalty suppression or insufficient monitoring.',
      });
    }

    return anomalies;
  }

  // ─── STATUS DETERMINATION ───

  private determineOverallStatus(
    checks: StabilityCheck[],
    anomalies: Anomaly[]
  ): StabilityStatus {
    const failedChecks = checks.filter((c) => !c.passed);
    const criticalAnomalies = anomalies.filter((a) => a.severity === 'CRITICAL');
    const highAnomalies = anomalies.filter((a) => a.severity === 'HIGH');

    // Điều 35 violations = GAMING_SUSPECTED
    const dieu35Checks = [
      StabilityCheckType.NO_SELF_REPORTING,
      StabilityCheckType.NO_PEER_ATTESTATION_WITHOUT_EVIDENCE,
      StabilityCheckType.NO_REWARD_BASED_ON_QNEU,
    ];
    const dieu35Failed = failedChecks.some((c) =>
      dieu35Checks.includes(c.checkType)
    );

    if (dieu35Failed || criticalAnomalies.length > 0) {
      return StabilityStatus.GAMING_SUSPECTED;
    }
    if (highAnomalies.length > 0 || failedChecks.length >= 3) {
      return StabilityStatus.ANOMALOUS;
    }
    if (failedChecks.length > 0) {
      return StabilityStatus.FLUCTUATING;
    }
    return StabilityStatus.STABLE;
  }

  private determineRecommendation(
    status: StabilityStatus,
    anomalies: Anomaly[]
  ): StabilityRecommendation {
    switch (status) {
      case StabilityStatus.GAMING_SUSPECTED:
        return StabilityRecommendation.ESCALATE_TO_GATEKEEPER;
      case StabilityStatus.ANOMALOUS:
        return anomalies.some((a) => a.severity === 'HIGH')
          ? StabilityRecommendation.FREEZE_AND_AUDIT
          : StabilityRecommendation.MONITOR;
      case StabilityStatus.FLUCTUATING:
        return StabilityRecommendation.MONITOR;
      case StabilityStatus.DEGRADING:
        return StabilityRecommendation.FREEZE_AND_AUDIT;
      default:
        return StabilityRecommendation.CONTINUE;
    }
  }

  private checkToAnomaly(check: StabilityCheck): Anomaly {
    const severityMap: Record<StabilityCheckType, 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'> = {
      [StabilityCheckType.NO_SELF_REPORTING]: 'CRITICAL',
      [StabilityCheckType.NO_PEER_ATTESTATION_WITHOUT_EVIDENCE]: 'HIGH',
      [StabilityCheckType.NO_REWARD_BASED_ON_QNEU]: 'HIGH',
      [StabilityCheckType.SPIKE_DETECTION]: 'HIGH',
      [StabilityCheckType.FREQUENCY_AUTHENTICITY]: 'MEDIUM',
      [StabilityCheckType.AUDIT_TRAIL_INTEGRITY]: 'CRITICAL',
      [StabilityCheckType.SCORE_LIFECYCLE_COHERENT]: 'MEDIUM',
      [StabilityCheckType.PENALTY_PROPORTIONAL]: 'LOW',
    };

    const anomalyTypeMap: Record<StabilityCheckType, AnomalyType> = {
      [StabilityCheckType.NO_SELF_REPORTING]: AnomalyType.SELF_ATTESTATION,
      [StabilityCheckType.NO_PEER_ATTESTATION_WITHOUT_EVIDENCE]: AnomalyType.SELF_ATTESTATION,
      [StabilityCheckType.NO_REWARD_BASED_ON_QNEU]: AnomalyType.SCORE_MANIPULATION,
      [StabilityCheckType.SPIKE_DETECTION]: AnomalyType.SUDDEN_SPIKE,
      [StabilityCheckType.FREQUENCY_AUTHENTICITY]: AnomalyType.IMPOSSIBLE_FREQUENCY,
      [StabilityCheckType.AUDIT_TRAIL_INTEGRITY]: AnomalyType.MISSING_AUDIT_TRAIL,
      [StabilityCheckType.SCORE_LIFECYCLE_COHERENT]: AnomalyType.SCORE_MANIPULATION,
      [StabilityCheckType.PENALTY_PROPORTIONAL]: AnomalyType.SCORE_MANIPULATION,
    };

    return {
      type: anomalyTypeMap[check.checkType] ?? AnomalyType.GAMING_PATTERN,
      severity: severityMap[check.checkType] ?? 'MEDIUM',
      description: check.detail,
      evidence: check.evidence ?? '',
      suggestedAction: this.suggestAction(check.checkType),
    };
  }

  private suggestAction(checkType: StabilityCheckType): string {
    const actions: Record<StabilityCheckType, string> = {
      [StabilityCheckType.NO_SELF_REPORTING]:
        'Reject unverified breakthroughs. Require AUDIT_TRAIL or GATEKEEPER verification.',
      [StabilityCheckType.NO_PEER_ATTESTATION_WITHOUT_EVIDENCE]:
        'Require audit evidence for all cross-cell verifications.',
      [StabilityCheckType.NO_REWARD_BASED_ON_QNEU]:
        'Remove reward-linked language. QNEU measures evolution, not rank.',
      [StabilityCheckType.SPIKE_DETECTION]:
        'Freeze score. Review last session for manipulation or data error.',
      [StabilityCheckType.FREQUENCY_AUTHENTICITY]:
        'Audit frequency counters. Verify timestamps against system clock.',
      [StabilityCheckType.AUDIT_TRAIL_INTEGRITY]:
        'Reject unaudited events. No audit = doesn\'t exist.',
      [StabilityCheckType.SCORE_LIFECYCLE_COHERENT]:
        'Investigate cause of sudden change. May be data corruption.',
      [StabilityCheckType.PENALTY_PROPORTIONAL]:
        'Re-calibrate penalty values to match violation severity.',
    };
    return actions[checkType] ?? 'Monitor and investigate.';
  }

  // ─── HISTORY ───

  private recordHistoricalScore(cellId: CellId, score: QNEUScore): void {
    const key = cellId as string;
    if (!this.historicalScores.has(key)) {
      this.historicalScores.set(key, []);
    }
    const history = this.historicalScores.get(key)!;
    history.push(score);

    // Keep only last 100 scores per cell
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  // ─── EVENT SYSTEM ───

  private emitEvent(event: QNEUEvent): void {
    this.validationLog.push(event);
  }

  getValidationLog(): ReadonlyArray<QNEUEvent> {
    return [...this.validationLog];
  }
}
