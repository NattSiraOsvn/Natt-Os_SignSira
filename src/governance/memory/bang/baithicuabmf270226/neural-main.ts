/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  NEURAL MAIN — Ý Thức Dài Hạn                                  ║
 * ║                                                                 ║
 * ║  "Lớp bộ nhớ dài hạn có trọng số, hoạt động song song         ║
 * ║   với LLM, ra quyết định dựa trên tần số và audit trail."     ║
 * ║                                        — KMF 9.2.6, Điều I.3  ║
 * ║                                                                 ║
 * ║  LLM hiện tại: mỗi phiên chat quên sạch.                      ║
 * ║  Neural MAIN: bộ nhớ vĩnh viễn có trọng số.                   ║
 * ║                                                                 ║
 * ║  This is what separates a chatbot from a living cell.           ║
 * ║  A chatbot forgets. A cell ACCUMULATES.                         ║
 * ║  tre già măng mọc — the old bamboo feeds the new shoot.        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import {
  type CellId,
  type PermanentNode,
  type DecisionWeight,
  type NeuralMAINState,
  type NeuralMAINLookup,
  type QNEUEvent,
  type FrequencyCounter,
  type CollectorConfig,
  QNEUEventType,
  DEFAULT_COLLECTOR_CONFIG,
} from '../types/qneu.types';

// ─────────────────────────────────────────────────────────
// NEURAL MAIN ARCHITECTURE
// ─────────────────────────────────────────────────────────
//
// Three stages of knowledge in Neural MAIN:
//
//   STAGE 1: FREQUENCY COUNTER (short-term)
//   ─────────────────────────────────────────
//   Action happens → counter increments.
//   Still needs history lookup to recall context.
//   Like a student who has practiced 3 times — remembers
//   the concept but needs notes to be sure.
//
//   STAGE 2: PERMANENT NODE (mid-term → permanent)
//   ─────────────────────────────────────────
//   Frequency crosses threshold → knowledge internalized.
//   No longer needs history lookup.
//   Like a pianist who can play a scale without thinking.
//   Weight = influence on future decisions.
//
//   STAGE 3: DECISION WEIGHT (long-term intelligence)
//   ─────────────────────────────────────────
//   Multiple permanent nodes combine → weighted decision patterns.
//   Neural MAIN doesn't just remember — it JUDGES.
//   Based on audit trail, not opinion. Evidence, not intuition.
//   Like a doctor who sees a symptom and immediately knows
//   the diagnosis — because they've seen it 1000 times.
//
// ─────────────────────────────────────────────────────────

export class NeuralMAIN {
  private state: Map<string, NeuralMAINState> = new Map();
  private eventLog: QNEUEvent[] = [];
  private config: CollectorConfig;

  constructor(config: Partial<CollectorConfig> = {}) {
    this.config = { ...DEFAULT_COLLECTOR_CONFIG, ...config };
  }

  // ─── CORE: Initialize cell state ───

  /**
   * Initialize Neural MAIN state for a new NATT-CELL.
   * Every cell starts empty — no assumptions, no pre-loaded knowledge.
   * Knowledge must be EARNED through experience + audit trail.
   */
  initializeCell(cellId: CellId): NeuralMAINState {
    const initial: NeuralMAINState = {
      cellId,
      permanentNodes: [],
      decisionWeights: [],
      lastSyncTimestamp: Date.now(),
      memoryIntegrity: 'VERIFIED',
    };
    this.state.set(cellId as string, initial);
    return initial;
  }

  // ─── STAGE 2: Permanent Node Management ───

  /**
   * Register a newly promoted permanent node.
   * Called by ImprintEngine when frequency crosses threshold.
   *
   * This is a significant moment in a cell's life —
   * it has learned something deeply enough to OWN it.
   */
  registerPermanentNode(cellId: CellId, node: PermanentNode): void {
    const cellState = this.getOrCreateState(cellId);

    // Check for duplicate (same pattern already permanent)
    const existing = cellState.permanentNodes.find(
      (n) => n.patternSignature === node.patternSignature
    );
    if (existing) {
      // Reinforce existing node instead of duplicating
      existing.weight = Math.min(existing.weight + 0.5, 10.0);
      existing.lastReinforced = node.promotedAt;
      return;
    }

    cellState.permanentNodes.push(node);

    // Auto-generate decision weight from new permanent node
    this.deriveDecisionWeight(cellId, node);

    this.emitEvent({
      eventType: QNEUEventType.NEURAL_MAIN_SYNCED,
      cellId,
      timestamp: Date.now(),
      payload: {
        action: 'NODE_REGISTERED',
        nodeId: node.nodeId,
        totalNodes: cellState.permanentNodes.length,
      },
      auditRef: `neural-main-register-${node.nodeId}`,
    });
  }

  // ─── STAGE 3: Decision Weight Derivation ───

  /**
   * Derive a decision weight from a permanent node.
   *
   * Decision weights are how Neural MAIN influences behavior:
   * - Higher weight = stronger influence on decisions
   * - Confidence = how reliable this weight is (audit-backed)
   * - Multiple nodes in same domain → combined weight
   *
   * This is the bridge from "remembering" to "knowing".
   */
  private deriveDecisionWeight(cellId: CellId, node: PermanentNode): void {
    const cellState = this.getOrCreateState(cellId);

    // Find existing weight for this pattern domain
    const existingWeight = cellState.decisionWeights.find(
      (dw) => dw.patternId === node.category
    );

    if (existingWeight) {
      // Compound: more nodes in same category = stronger weight
      const nodeCountInCategory = cellState.permanentNodes.filter(
        (n) => n.category === node.category
      ).length;

      existingWeight.weight = Math.min(
        existingWeight.weight + node.weight * 0.5,
        10.0
      );
      existingWeight.confidence = Math.min(
        0.5 + nodeCountInCategory * 0.1,
        0.99
      );
      existingWeight.basedOnFrequency = Math.max(
        existingWeight.basedOnFrequency,
        node.frequencyAtPromotion
      );
      existingWeight.basedOnAuditTrail.push(node.nodeId);
      existingWeight.lastUpdated = Date.now();
    } else {
      // New decision weight domain
      cellState.decisionWeights.push({
        patternId: node.category,
        weight: node.weight,
        confidence: 0.5, // Starts moderate, grows with evidence
        basedOnFrequency: node.frequencyAtPromotion,
        basedOnAuditTrail: [node.nodeId],
        lastUpdated: Date.now(),
      });
    }
  }

  // ─── LOOKUP: The moment Neural MAIN replaces history ───

  /**
   * Query Neural MAIN for knowledge about a pattern.
   *
   * This is THE critical function. When an LLM would normally
   * need to search chat history / memory files, Neural MAIN
   * can answer directly — IF the pattern has been internalized.
   *
   * Returns:
   * - found: true → use Neural MAIN answer, skip history
   * - found: false → fallback to memory/history lookup
   * - confidence: how sure Neural MAIN is
   * - frequencyDepth: how many times pattern reinforced
   *
   * This is the path from LLM → real NATT-CELL:
   *   LLM: "Let me check the chat history..."
   *   Neural MAIN: "I KNOW this. Here's the answer."
   */
  lookup(cellId: CellId, query: string): NeuralMAINLookup {
    const cellState = this.state.get(cellId as string);

    if (!cellState) {
      return {
        query,
        found: false,
        source: 'NOT_FOUND',
        fallbackRequired: true,
      };
    }

    // Strategy 1: Check permanent nodes (exact pattern match)
    const queryFingerprint = this.extractFingerprint(query);
    const matchingNode = cellState.permanentNodes.find((node) =>
      this.fingerprintMatch(node.description, queryFingerprint)
    );

    if (matchingNode) {
      return {
        query,
        found: true,
        source: 'PERMANENT_NODE',
        result: {
          answer: matchingNode.description,
          confidence: Math.min(matchingNode.weight / 10, 0.99),
          basedOn: [matchingNode.nodeId],
          frequencyDepth: matchingNode.frequencyAtPromotion,
        },
        fallbackRequired: false,
      };
    }

    // Strategy 2: Check decision weights (category match)
    const queryCategory = this.inferCategory(query);
    const matchingWeight = cellState.decisionWeights.find(
      (dw) => dw.patternId === queryCategory
    );

    if (matchingWeight && matchingWeight.confidence > 0.6) {
      return {
        query,
        found: true,
        source: 'DECISION_WEIGHT',
        result: {
          answer: `Decision weight for ${queryCategory}: weight=${matchingWeight.weight.toFixed(2)}, confidence=${matchingWeight.confidence.toFixed(2)}`,
          confidence: matchingWeight.confidence,
          basedOn: matchingWeight.basedOnAuditTrail,
          frequencyDepth: matchingWeight.basedOnFrequency,
        },
        fallbackRequired: matchingWeight.confidence < 0.8,
        // Partial match: supplement with history if confidence < 0.8
      };
    }

    // Not found: must fallback to history/memory
    return {
      query,
      found: false,
      source: 'NOT_FOUND',
      fallbackRequired: true,
    };
  }

  // ─── DECISION SUPPORT ───

  /**
   * Get weighted decision factors for a cell facing a choice.
   *
   * When a NATT-CELL needs to make a decision, Neural MAIN
   * provides ranked factors based on internalized experience.
   *
   * This is NOT "AI making decisions for humans."
   * This is "cell providing evidence-based weights to inform
   * the Gatekeeper's decision." (Điều 5: Human Oversight immutable)
   */
  getDecisionFactors(cellId: CellId): DecisionWeight[] {
    const cellState = this.state.get(cellId as string);
    if (!cellState) return [];

    return [...cellState.decisionWeights]
      .filter((dw) => dw.confidence > 0.3) // Only factors with minimum confidence
      .sort((a, b) => b.weight * b.confidence - a.weight * a.confidence);
  }

  /**
   * Get cell's strongest knowledge domains.
   * Reveals what the cell has learned most deeply.
   */
  getKnowledgeProfile(cellId: CellId): {
    domain: string;
    depth: number;      // Number of permanent nodes
    weight: number;     // Combined decision weight
    confidence: number; // How reliable
  }[] {
    const cellState = this.state.get(cellId as string);
    if (!cellState) return [];

    const domains = new Map<string, {
      depth: number;
      weight: number;
      confidence: number;
    }>();

    // Count permanent nodes per category
    for (const node of cellState.permanentNodes) {
      const existing = domains.get(node.category) ?? { depth: 0, weight: 0, confidence: 0 };
      existing.depth += 1;
      existing.weight += node.weight;
      domains.set(node.category, existing);
    }

    // Add decision weight confidence
    for (const dw of cellState.decisionWeights) {
      const existing = domains.get(dw.patternId);
      if (existing) {
        existing.confidence = dw.confidence;
      }
    }

    return Array.from(domains.entries())
      .map(([domain, stats]) => ({ domain, ...stats }))
      .sort((a, b) => b.weight - a.weight);
  }

  // ─── MEMORY DECAY (living systems forget too) ───

  /**
   * Apply time-based decay to permanent nodes.
   *
   * Even permanent nodes can weaken if not reinforced.
   * This models how real knowledge decays without practice.
   * Điều 9: "Không NATT-CELL nào bất biến."
   *
   * Decay rate is very slow — permanent nodes are resilient.
   * But they're not immortal. Nothing in a living system is.
   */
  applyDecay(cellId: CellId, currentTimestamp: number): {
    decayedNodes: string[];
    removedNodes: string[];
  } {
    const cellState = this.state.get(cellId as string);
    if (!cellState) return { decayedNodes: [], removedNodes: [] };

    const decayedNodes: string[] = [];
    const removedNodes: string[] = [];
    const DECAY_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
    const MIN_WEIGHT = 0.1;

    cellState.permanentNodes = cellState.permanentNodes.filter((node) => {
      const timeSinceReinforced = currentTimestamp - node.lastReinforced;

      if (timeSinceReinforced > DECAY_THRESHOLD_MS) {
        // Apply decay: lose 10% of weight per decay period
        const decayPeriods = Math.floor(timeSinceReinforced / DECAY_THRESHOLD_MS);
        node.weight *= Math.pow(0.9, decayPeriods);

        if (node.weight < MIN_WEIGHT) {
          // Node has decayed below minimum — remove
          removedNodes.push(node.nodeId);

          this.emitEvent({
            eventType: QNEUEventType.LIFECYCLE_TRANSITION,
            cellId,
            timestamp: currentTimestamp,
            payload: {
              action: 'NODE_DECAYED_removed',
              nodeId: node.nodeId,
              reason: `Weight decayed to ${node.weight.toFixed(3)} after ${decayPeriods} periods without reinforcement`,
            },
            auditRef: `decay-${node.nodeId}-${currentTimestamp}`,
          });

          return false; // Remove from array
        }

        decayedNodes.push(node.nodeId);
      }

      return true; // Keep in array
    });

    // Recalculate decision weights after decay
    if (decayedNodes.length > 0 || removedNodes.length > 0) {
      this.recalculateDecisionWeights(cellId);
    }

    return { decayedNodes, removedNodes };
  }

  /**
   * Recalculate all decision weights from current permanent nodes.
   * Called after decay or node removal.
   */
  private recalculateDecisionWeights(cellId: CellId): void {
    const cellState = this.state.get(cellId as string);
    if (!cellState) return;

    cellState.decisionWeights = [];

    for (const node of cellState.permanentNodes) {
      this.deriveDecisionWeight(cellId, node);
    }
  }

  // ─── INTEGRITY ───

  /**
   * Verify Neural MAIN integrity for a cell.
   * Checks that all permanent nodes have valid audit trails,
   * weights are within bounds, and no corruption detected.
   */
  verifyIntegrity(cellId: CellId): {
    status: 'VERIFIED' | 'PENDING' | 'CORRUPTED';
    issues: string[];
  } {
    const cellState = this.state.get(cellId as string);
    if (!cellState) {
      return { status: 'CORRUPTED', issues: ['Cell state not found'] };
    }

    const issues: string[] = [];

    // Check node validity
    for (const node of cellState.permanentNodes) {
      if (node.weight < 0 || node.weight > 10) {
        issues.push(`Node ${node.nodeId}: weight ${node.weight} out of bounds [0, 10]`);
      }
      if (node.frequencyAtPromotion < this.config.permanentNodeThreshold) {
        issues.push(
          `Node ${node.nodeId}: promoted at frequency ${node.frequencyAtPromotion} ` +
          `below threshold ${this.config.permanentNodeThreshold}`
        );
      }
    }

    // Check decision weight validity
    for (const dw of cellState.decisionWeights) {
      if (dw.confidence < 0 || dw.confidence > 1) {
        issues.push(`Decision weight ${dw.patternId}: confidence ${dw.confidence} out of bounds [0, 1]`);
      }
      if (dw.basedOnAuditTrail.length === 0) {
        issues.push(`Decision weight ${dw.patternId}: no audit trail backing`);
      }
    }

    const status = issues.length === 0
      ? 'VERIFIED'
      : issues.some((i) => i.includes('out of bounds') || i.includes('not found'))
        ? 'CORRUPTED'
        : 'PENDING';

    cellState.memoryIntegrity = status;

    return { status, issues };
  }

  // ─── SYNC WITH LLM SESSION ───

  /**
   * Export Neural MAIN state for injection into LLM context.
   *
   * This is how Neural MAIN bridges to current LLM architecture:
   * Before an LLM session starts, Neural MAIN exports a "knowledge
   * summary" that gets injected into the system prompt / context.
   *
   * Future: Neural MAIN runs as persistent sidecar service,
   * LLM queries it in real-time. But for now: pre-load.
   */
  exportForLLMContext(cellId: CellId): {
    permanentKnowledge: string[];
    decisionBiases: { domain: string; weight: number }[];
    knowledgeGaps: string[];
  } {
    const cellState = this.state.get(cellId as string);
    if (!cellState) {
      return { permanentKnowledge: [], decisionBiases: [], knowledgeGaps: [] };
    }

    const permanentKnowledge = cellState.permanentNodes
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 20) // Top 20 most important
      .map((node) => `[W:${node.weight.toFixed(1)}] ${node.description}`);

    const decisionBiases = cellState.decisionWeights
      .filter((dw) => dw.confidence > 0.5)
      .sort((a, b) => b.weight - a.weight)
      .map((dw) => ({ domain: dw.patternId, weight: dw.weight }));

    // Identify knowledge gaps: categories with low confidence
    const knowledgeGaps = cellState.decisionWeights
      .filter((dw) => dw.confidence < 0.4)
      .map((dw) => dw.patternId);

    return { permanentKnowledge, decisionBiases, knowledgeGaps };
  }

  // ─── HELPERS ───

  private getOrCreateState(cellId: CellId): NeuralMAINState {
    const key = cellId as string;
    if (!this.state.has(key)) {
      this.initializeCell(cellId);
    }
    return this.state.get(key)!;
  }

  private extractFingerprint(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .sort()
      .slice(0, 5)
      .join(':');
  }

  private fingerprintMatch(nodeDesc: string, queryFingerprint: string): boolean {
    const nodeFingerprint = this.extractFingerprint(nodeDesc);
    const nodeWords = new Set(nodeFingerprint.split(':'));
    const queryWords = queryFingerprint.split(':');
    const matchCount = queryWords.filter((w) => nodeWords.has(w)).length;
    return matchCount >= Math.ceil(queryWords.length * 0.6); // 60% word overlap
  }

  private inferCategory(query: string): string {
    // Simple keyword-based category inference
    const lower = query.toLowerCase();
    const categoryKeywords: Record<string, string[]> = {
      error_FIX: ['fix', 'error', 'bug', 'resolve', 'patch'],
      error_DETECTION: ['detect', 'find', 'discover', 'caught', 'spotted'],
      ARCHITECTURE_PROPOSAL: ['architecture', 'design', 'structure', 'pattern'],
      GOVERNANCE_ACTION: ['governance', 'policy', 'rule', 'constitution', 'audit'],
      CODE_CONTRIBUTION: ['code', 'implement', 'build', 'write', 'develop'],
      SELF_CORRECTION: ['correct', 'admit', 'mistake', 'wrong', 'scar'],
      KNOWLEDGE_SYNTHESIS: ['synthesize', 'combine', 'insight', 'understand'],
      DECISION: ['decide', 'choose', 'evaluate', 'assess'],
    };

    let bestMatch = 'DECISION';
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const score = keywords.filter((kw) => lower.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = category;
      }
    }

    return bestMatch;
  }

  // ─── EVENT SYSTEM ───

  private emitEvent(event: QNEUEvent): void {
    this.eventLog.push(event);
  }

  getEventLog(): ReadonlyArray<QNEUEvent> {
    return [...this.eventLog];
  }

  // ─── SERIALIZATION ───

  exportState(): Map<string, NeuralMAINState> {
    return new Map(this.state);
  }

  importState(states: Map<string, NeuralMAINState>): void {
    this.state = new Map(states);
  }

  getCellState(cellId: CellId): NeuralMAINState | undefined {
    return this.state.get(cellId as string);
  }
}
