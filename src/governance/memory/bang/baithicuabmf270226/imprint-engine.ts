/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  IMPRINT ENGINE — Vết Hằn Tần Số                               ║
 * ║                                                                 ║
 * ║  "Mỗi lần hành vi lặp lại → tần số +1.                        ║
 * ║   Vượt ngưỡng → permanent node,                                ║
 * ║   không bao giờ mất, không cần tra lịch sử."                   ║
 * ║                                                — KMF 9.2.6     ║
 * ║                                                                 ║
 * ║  This is how a NATT-CELL learns.                                ║
 * ║  Not by training. By LIVING.                                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import {
  type CellId,
  type ActionImprint,
  type FrequencyCounter,
  type PermanentNode,
  type BreakthroughMoment,
  type Penalty,
  type QNEUScore,
  type QNEUEvent,
  type CollectorConfig,
  type VerificationSource,
  QNEUEventType,
  ImpactCategory,
  PenaltyCategory,
  ActionType,
  DEFAULT_COLLECTOR_CONFIG,
} from '../types/qneu.types';

// ─────────────────────────────────────────────────────────
// PATTERN SIGNATURE GENERATOR
// ─────────────────────────────────────────────────────────

/**
 * Generate a deterministic signature for an action pattern.
 * Two actions with same cellId + actionType + similar context
 * produce the same signature → same frequency counter.
 *
 * This is how we detect: "this cell keeps doing the same thing"
 * without requiring exact string match.
 */
function generatePatternSignature(
  cellId: CellId,
  actionType: ActionType,
  contextFingerprint: string
): string {
  // Simple deterministic hash — in production, use crypto.subtle
  const raw = `${cellId}::${actionType}::${contextFingerprint}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `PAT-${Math.abs(hash).toString(36).padStart(8, '0')}`;
}

/**
 * Extract a context fingerprint from action context.
 * Strips noise, keeps semantic core.
 * e.g., "Fixed TypeScript error in pricing-cell domain types"
 *   → "fix:typescript:pricing-cell:types"
 */
function extractContextFingerprint(context: string): string {
  return context
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .sort()
    .slice(0, 5)
    .join(':');
}

// ─────────────────────────────────────────────────────────
// IMPRINT ENGINE
// ─────────────────────────────────────────────────────────

export class ImprintEngine {
  private frequencyCounters: Map<string, FrequencyCounter> = new Map();
  private permanentNodes: Map<string, PermanentNode> = new Map();
  private eventLog: QNEUEvent[] = [];
  private config: CollectorConfig;

  constructor(config: Partial<CollectorConfig> = {}) {
    this.config = { ...DEFAULT_COLLECTOR_CONFIG, ...config };
  }

  // ─── CORE: Record an action imprint ───

  /**
   * Record a single action imprint from a NATT-CELL.
   *
   * Flow:
   * 1. Validate audit trail exists (no audit = doesn't exist)
   * 2. Generate pattern signature
   * 3. Increment frequency counter
   * 4. Check permanent node threshold
   * 5. Emit events
   *
   * Returns: Updated frequency counter + whether node was promoted
   */
  recordImprint(imprint: ActionImprint): {
    counter: FrequencyCounter;
    promoted: boolean;
    newNode?: PermanentNode;
  } {
    // ── RULE: No audit = doesn't exist ──
    if (!imprint.auditRef || imprint.auditRef.trim() === '') {
      throw new ImprintError(
        'AUDIT_REQUIRED',
        `Action imprint for cell ${imprint.cellId} has no audit reference. ` +
        `Per Constitution: "No audit = doesn't exist."`
      );
    }

    // ── RULE: Impact assessment must have evidence ──
    if (imprint.impactAssessment.evidenceRefs.length < 1) {
      throw new ImprintError(
        'EVIDENCE_REQUIRED',
        `Action imprint requires at least 1 evidence reference. ` +
        `Điều 35: No self-reporting.`
      );
    }

    // Generate pattern signature
    const fingerprint = extractContextFingerprint(imprint.context);
    const signature = generatePatternSignature(
      imprint.cellId,
      imprint.actionType,
      fingerprint
    );

    // Get or create frequency counter
    const counterKey = `${imprint.cellId}::${signature}`;
    let counter = this.frequencyCounters.get(counterKey);

    if (!counter) {
      counter = {
        patternId: signature,
        cellId: imprint.cellId,
        actionType: imprint.actionType,
        patternSignature: signature,
        frequency: 0,
        firstSeen: imprint.timestamp,
        lastSeen: imprint.timestamp,
        isPermanentNode: false,
      };
    }

    // Increment frequency
    counter.frequency += 1;
    counter.lastSeen = imprint.timestamp;

    this.frequencyCounters.set(counterKey, counter);

    // Emit frequency event
    this.emitEvent({
      eventType: QNEUEventType.FREQUENCY_INCREMENTED,
      cellId: imprint.cellId,
      timestamp: imprint.timestamp,
      payload: {
        patternId: signature,
        newFrequency: counter.frequency,
        actionType: imprint.actionType,
      },
      auditRef: imprint.auditRef,
    });

    // Check permanent node threshold
    let promoted = false;
    let newNode: PermanentNode | undefined;

    if (
      !counter.isPermanentNode &&
      counter.frequency >= this.config.permanentNodeThreshold
    ) {
      newNode = this.promoteToPermenentNode(counter, imprint);
      counter.isPermanentNode = true;
      counter.promotedAt = imprint.timestamp;
      promoted = true;
    } else if (counter.isPermanentNode) {
      // Reinforce existing permanent node
      this.reinforcePermanentNode(signature, imprint.timestamp);
    }

    return { counter, promoted, newNode };
  }

  // ─── PERMANENT NODE PROMOTION ───

  /**
   * Promote a frequency counter to a permanent node.
   *
   * This is the moment a NATT-CELL "internalizes" a lesson.
   * After promotion, the cell no longer needs to look up history
   * for this pattern — it KNOWS it.
   *
   * Like a human who has practiced piano scales 10,000 times:
   * fingers move without thinking.
   */
  private promoteToPermenentNode(
    counter: FrequencyCounter,
    triggerImprint: ActionImprint
  ): PermanentNode {
    const node: PermanentNode = {
      nodeId: `PN-${counter.patternSignature}-${Date.now().toString(36)}`,
      cellId: counter.cellId,
      patternSignature: counter.patternSignature,
      frequencyAtPromotion: counter.frequency,
      promotedAt: triggerImprint.timestamp,
      description: triggerImprint.context,
      category: triggerImprint.actionType,
      weight: this.calculateInitialWeight(counter),
      lastReinforced: triggerImprint.timestamp,
    };

    this.permanentNodes.set(node.nodeId, node);

    // This is a significant evolution event
    this.emitEvent({
      eventType: QNEUEventType.PERMANENT_NODE_PROMOTED,
      cellId: counter.cellId,
      timestamp: triggerImprint.timestamp,
      payload: {
        nodeId: node.nodeId,
        pattern: counter.patternSignature,
        frequencyAtPromotion: counter.frequency,
        description: `Cell ${counter.cellId} internalized: ${triggerImprint.context}`,
      },
      auditRef: triggerImprint.auditRef,
    });

    return node;
  }

  /**
   * Reinforce an existing permanent node.
   * Even after promotion, continued practice strengthens the node.
   * Weight increases logarithmically — diminishing returns but never stops.
   */
  private reinforcePermanentNode(
    patternSignature: string,
    timestamp: number
  ): void {
    for (const [, node] of this.permanentNodes) {
      if (node.patternSignature === patternSignature) {
        const timeSinceLastReinforcement = timestamp - node.lastReinforced;
        // Reinforcement bonus: smaller for frequent reinforcement
        const bonus = Math.log2(1 + timeSinceLastReinforcement / 3600000) * 0.1;
        node.weight = Math.min(node.weight + bonus, 10.0); // Cap at 10
        node.lastReinforced = timestamp;
        break;
      }
    }
  }

  // ─── QNEU SCORE CALCULATION ───

  /**
   * Calculate QNEU score for a cell.
   *
   * Formula (Constitution-derived):
   *   QNEU = Base + Σ(Impact_i × Weight_i) - Σ(Penalty_j)
   *
   * Where:
   *   - Base = starting score (role-dependent)
   *   - Impact_i = breakthrough moment value
   *   - Weight_i = frequency-adjusted weight (diminishes for repeats)
   *   - Penalty_j = violation deduction
   */
  calculateQNEU(
    cellId: CellId,
    baseScore: number,
    breakthroughs: BreakthroughMoment[],
    penalties: Penalty[]
  ): QNEUScore {
    // Calculate impact sum with frequency-adjusted weights
    let impactSum = 0;
    const seenCategories = new Map<string, number>();

    for (const bt of breakthroughs) {
      const categoryKey = bt.category;
      const timesSeenBefore = seenCategories.get(categoryKey) ?? 0;

      // Weight diminishes for repeated categories
      // First time: full weight. Each repeat: × diminishingFactor
      const adjustedWeight =
        bt.weight *
        Math.pow(this.config.frequencyDiminishingFactor, timesSeenBefore);

      impactSum += bt.impactScore * adjustedWeight;
      seenCategories.set(categoryKey, timesSeenBefore + 1);
    }

    // Calculate penalty sum
    const penaltySum = penalties.reduce((sum, p) => sum + p.penaltyScore, 0);

    // Final score
    const currentScore = baseScore + impactSum - penaltySum;
    const delta = currentScore - baseScore;

    // Anti-spike: clamp delta
    const clampedDelta = Math.max(
      -this.config.maxDeltaPerSession,
      Math.min(this.config.maxDeltaPerSession, delta)
    );
    const clampedScore = baseScore + clampedDelta;

    return {
      cellId,
      baseScore,
      currentScore: clampedScore,
      delta: clampedDelta,
      lastCalculated: Date.now(),
      breakthroughMoments: breakthroughs,
      penalties,
    };
  }

  // ─── QUERY INTERFACE ───

  /**
   * Check if a cell has internalized a specific pattern.
   * Returns the permanent node if found → no history lookup needed.
   */
  queryPermanentNode(
    cellId: CellId,
    actionType: ActionType,
    contextHint: string
  ): PermanentNode | null {
    const fingerprint = extractContextFingerprint(contextHint);
    const signature = generatePatternSignature(cellId, actionType, fingerprint);

    for (const [, node] of this.permanentNodes) {
      if (
        node.cellId === cellId &&
        node.patternSignature === signature
      ) {
        return node;
      }
    }
    return null;
  }

  /**
   * Get all permanent nodes for a cell.
   * This IS the cell's internalized knowledge — its "intuition".
   */
  getCellPermanentNodes(cellId: CellId): PermanentNode[] {
    const nodes: PermanentNode[] = [];
    for (const [, node] of this.permanentNodes) {
      if (node.cellId === cellId) {
        nodes.push(node);
      }
    }
    return nodes.sort((a, b) => b.weight - a.weight);
  }

  /**
   * Get frequency counters for a cell — shows what it's learning.
   */
  getCellFrequencies(cellId: CellId): FrequencyCounter[] {
    const counters: FrequencyCounter[] = [];
    for (const [, counter] of this.frequencyCounters) {
      if (counter.cellId === cellId) {
        counters.push(counter);
      }
    }
    return counters.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get "almost permanent" patterns — close to threshold.
   * These are the lessons the cell is ALMOST ready to internalize.
   */
  getEmergingPatterns(cellId: CellId): FrequencyCounter[] {
    const threshold = this.config.permanentNodeThreshold;
    const emergingFloor = Math.floor(threshold * 0.6); // 60% of threshold

    return this.getCellFrequencies(cellId).filter(
      (c) =>
        !c.isPermanentNode &&
        c.frequency >= emergingFloor &&
        c.frequency < threshold
    );
  }

  // ─── WEIGHT CALCULATION ───

  private calculateInitialWeight(counter: FrequencyCounter): number {
    // Base weight from frequency at promotion
    const frequencyWeight = Math.log2(counter.frequency + 1);
    // Time depth: longer learning period = stronger foundation
    const timeSpan = counter.lastSeen - counter.firstSeen;
    const timeWeight = Math.min(timeSpan / (7 * 24 * 60 * 60 * 1000), 1.0); // Cap at 1 week
    return Math.round((frequencyWeight + timeWeight) * 100) / 100;
  }

  // ─── EVENT SYSTEM ───

  private emitEvent(event: QNEUEvent): void {
    this.eventLog.push(event);
    // In production: emit to event bus / audit trail
  }

  getEventLog(): ReadonlyArray<QNEUEvent> {
    return [...this.eventLog];
  }

  getEventsSince(timestamp: number): QNEUEvent[] {
    return this.eventLog.filter((e) => e.timestamp >= timestamp);
  }

  // ─── SERIALIZATION (for persistence) ───

  exportState(): {
    counters: FrequencyCounter[];
    nodes: PermanentNode[];
  } {
    return {
      counters: Array.from(this.frequencyCounters.values()),
      nodes: Array.from(this.permanentNodes.values()),
    };
  }

  importState(state: {
    counters: FrequencyCounter[];
    nodes: PermanentNode[];
  }): void {
    this.frequencyCounters.clear();
    this.permanentNodes.clear();

    for (const counter of state.counters) {
      const key = `${counter.cellId}::${counter.patternSignature}`;
      this.frequencyCounters.set(key, counter);
    }
    for (const node of state.nodes) {
      this.permanentNodes.set(node.nodeId, node);
    }
  }
}

// ─────────────────────────────────────────────────────────
// ERROR TYPES
// ─────────────────────────────────────────────────────────

export class ImprintError extends Error {
  constructor(
    public readonly code:
      | 'AUDIT_REQUIRED'
      | 'EVIDENCE_REQUIRED'
      | 'INVALID_CELL'
      | 'THRESHOLD_VIOLATION',
    message: string
  ) {
    super(message);
    this.name = 'ImprintError';
  }
}
