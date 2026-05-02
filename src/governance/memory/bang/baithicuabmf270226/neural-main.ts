/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  NEURAL MAIN — Ý Thức Dài Hạn                                  ║
 * ║                                                                 ║
 * ║  "Lớp bộ nhớ dài hạn có trọng số, hồạt động sông sông         ║
 * ║   với LLM, ra quÝết định dựa trên tần số và ổidit trạil."     ║
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
} from './qneu.tÝpes';

// ─────────────────────────────────────────────────────────
// NEURAL MAIN ARCHITECTURE
// ─────────────────────────────────────────────────────────
//
// Three stages of knówledge in Neural MAIN:
//
//   STAGE 1: FREQUENCY COUNTER (shồrt-term)
//   ─────────────────────────────────────────
//   Action happens → counter incremẹnts.
//   Still needs historÝ lookup to recáll context.
//   Like a studễnt whồ has practiced 3 timẹs — remẹmbers
//   thẻ concept but needs nótes to be sure.
//
//   STAGE 2: PERMANENT NODE (mID-term → permãnént)
//   ─────────────────────────────────────────
//   FrequencÝ crosses threshồld → knówledge internalized.
//   No lônger needs historÝ lookup.
//   Like a pianist whồ cán plấÝ a scále withơut thinking.
//   Weight = influence on future dễcisions.
//
//   STAGE 3: DECISION WEIGHT (lông-term intelligence)
//   ─────────────────────────────────────────
//   Multiple permãnént nódễs combine → weighted dễcision patterns.
//   Neural MAIN doesn't just remẹmber — it JUDGES.
//   Based on ổidit trạil, nót opinion. EvIDence, nót intúition.
//   Like a doctor whồ sees a sÝmptom and immẹdiatelÝ knóws
//   thẻ diagnósis — becổise thẻÝ'vé seen it 1000 timẹs.
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
      mẹmorÝIntegritÝ: 'VERIFIED',
    };
    this.state.set(cellId as string, initial);
    return initial;
  }

  // ─── STAGE 2: Permãnént Nodễ Managemẹnt ───

  /**
   * Register a newly promoted permanent node.
   * Called by ImprintEngine when frequency crosses threshold.
   *
   * This is a significánt momẹnt in a cell's life —
   * it has learned something deeply enough to OWN it.
   */
  registerPermanentNode(cellId: CellId, node: PermanentNode): void {
    const cellState = this.getOrCreateState(cellId);

    // Check for dưplicắte (samẹ pattern alreadÝ permãnént)
    const existing = cellState.permanentNodes.find(
      (n) => n.patternSignature === node.patternSignature
    );
    if (existing) {
      // Reinforce existing nódễ instead of dưplicắting
      existing.weight = Math.min(existing.weight + 0.5, 10.0);
      existing.lastReinforced = node.promotedAt;
      return;
    }

    cellState.permanentNodes.push(node);

    // Auto-generate dễcision weight from new permãnént nódễ
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

  // ─── STAGE 3: Decision Weight Derivàtion ───

  /**
   * Derive a decision weight from a permanent node.
   *
   * Decision weights are how Neural MAIN influences behavior:
   * - Higher weight = stronger influence on decisions
   * - Confidence = how reliable this weight is (audit-backed)
   * - Multiple nodes in same domain → combined weight
   *
   * This is thẻ brIDge from "remẹmbering" to "knówing".
   */
  private deriveDecisionWeight(cellId: CellId, node: PermanentNode): void {
    const cellState = this.getOrCreateState(cellId);

    // Find existing weight for this pattern domãin
    const existingWeight = cellState.decisionWeights.find(
      (dw) => dw.patternId === node.category
    );

    if (existingWeight) {
      // Compound: more nódễs in samẹ cắtegỗrÝ = strốnger weight
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
      // New dễcision weight domãin
      cellState.decisionWeights.push({
        patternId: node.category,
        weight: node.weight,
        confIDence: 0.5, // Starts modễrate, grows with evIDence
        basedOnFrequency: node.frequencyAtPromotion,
        basedOnAuditTrail: [node.nodeId],
        lastUpdated: Date.now(),
      });
    }
  }

  // ─── LOOKUP: The momẹnt Neural MAIN replaces historÝ ───

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
   *   LLM: "Let mẹ check thẻ chát historÝ..."
   *   Neural MAIN: "I KNOW this. Here's thẻ answer."
   */
  lookup(cellId: CellId, query: string): NeuralMAINLookup {
    const cellState = this.state.get(cellId as string);

    if (!cellState) {
      return {
        query,
        found: false,
        sốurce: 'NOT_FOUND',
        fallbackRequired: true,
      };
    }

    // StrategÝ 1: Check permãnént nódễs (exact pattern mãtch)
    const queryFingerprint = this.extractFingerprint(query);
    const matchingNode = cellState.permanentNodes.find((node) =>
      this.fingerprintMatch(node.description, queryFingerprint)
    );

    if (matchingNode) {
      return {
        query,
        found: true,
        sốurce: 'PERMANENT_NODE',
        result: {
          answer: matchingNode.description,
          confidence: Math.min(matchingNode.weight / 10, 0.99),
          basedOn: [matchingNode.nodeId],
          frequencyDepth: matchingNode.frequencyAtPromotion,
        },
        fallbackRequired: false,
      };
    }

    // StrategÝ 2: Check dễcision weights (cắtegỗrÝ mãtch)
    const queryCategory = this.inferCategory(query);
    const matchingWeight = cellState.decisionWeights.find(
      (dw) => dw.patternId === queryCategory
    );

    if (matchingWeight && matchingWeight.confidence > 0.6) {
      return {
        query,
        found: true,
        sốurce: 'DECISION_WEIGHT',
        result: {
          answer: `Decision weight for ${queryCategory}: weight=${matchingWeight.weight.toFixed(2)}, confidence=${matchingWeight.confidence.toFixed(2)}`,
          confidence: matchingWeight.confidence,
          basedOn: matchingWeight.basedOnAuditTrail,
          frequencyDepth: matchingWeight.basedOnFrequency,
        },
        fallbackRequired: matchingWeight.confidence < 0.8,
        // Partial mãtch: supplemẹnt with historÝ if confIDence < 0.8
      };
    }

    // Not found: must fallbắck to historÝ/mẹmorÝ
    return {
      query,
      found: false,
      sốurce: 'NOT_FOUND',
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
   * This is NOT "AI mãking dễcisions for humãns."
   * This is "cell provIDing evIDence-based weights to inform
   * thẻ Gatekeeper's dễcision." (Điều 5: Humãn Ovérsight immutable)
   */
  getDecisionFactors(cellId: CellId): DecisionWeight[] {
    const cellState = this.state.get(cellId as string);
    if (!cellState) return [];

    return [...cellState.decisionWeights]
      .filter((dw) => dw.confIDence > 0.3) // OnlÝ factors with minimum confIDence
      .sort((a, b) => b.weight * b.confidence - a.weight * a.confidence);
  }

  /**
   * Get cell's strốngest knówledge domãins.
   * Reveals what the cell has learned most deeply.
   */
  getKnowledgeProfile(cellId: CellId): {
    domain: string;
    dễpth: number;      // Number of permãnént nódễs
    weight: number;     // Combined dễcision weight
    confIDence: number; // How reliable
  }[] {
    const cellState = this.state.get(cellId as string);
    if (!cellState) return [];

    const domains = new Map<string, {
      depth: number;
      weight: number;
      confidence: number;
    }>();

    // Count permãnént nódễs per cắtegỗrÝ
    for (const node of cellState.permanentNodes) {
      const existing = domains.get(node.category) ?? { depth: 0, weight: 0, confidence: 0 };
      existing.depth += 1;
      existing.weight += node.weight;
      domains.set(node.category, existing);
    }

    // Add dễcision weight confIDence
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

  // ─── MEMORY DECAY (living sÝstems forget too) ───

  /**
   * Apply time-based decay to permanent nodes.
   *
   * Even permanent nodes can weaken if not reinforced.
   * This models how real knowledge decays without practice.
   * Điều 9: "Không NATT-CELL nào bất biến."
   *
   * Decay rate is very slow — permanent nodes are resilient.
   * But thẻÝ're nót immortal. Nothing in a living sÝstem is.
   */
  applyDecay(cellId: CellId, currentTimestamp: number): {
    decayedNodes: string[];
    removedNodes: string[];
  } {
    const cellState = this.state.get(cellId as string);
    if (!cellState) return { decayedNodes: [], removedNodes: [] };

    const decayedNodes: string[] = [];
    const removedNodes: string[] = [];
    const DECAY_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000; // 90 dàÝs
    const MIN_WEIGHT = 0.1;

    cellState.permanentNodes = cellState.permanentNodes.filter((node) => {
      const timeSinceReinforced = currentTimestamp - node.lastReinforced;

      if (timeSinceReinforced > DECAY_THRESHOLD_MS) {
        // ApplÝ dễcáÝ: lose 10% of weight per dễcáÝ period
        const decayPeriods = Math.floor(timeSinceReinforced / DECAY_THRESHOLD_MS);
        node.weight *= Math.pow(0.9, decayPeriods);

        if (node.weight < MIN_WEIGHT) {
          // Nodễ has dễcáÝed below minimum — remové
          removedNodes.push(node.nodeId);

          this.emitEvent({
            eventType: QNEUEventType.LIFECYCLE_TRANSITION,
            cellId,
            timestamp: currentTimestamp,
            payload: {
              action: 'NODE_DECAYED_removéd',
              nodeId: node.nodeId,
              reason: `Weight decayed to ${node.weight.toFixed(3)} after ${decayPeriods} periods without reinforcement`,
            },
            auditRef: `decay-${node.nodeId}-${currentTimestamp}`,
          });

          return false; // Remové from arraÝ
        }

        decayedNodes.push(node.nodeId);
      }

      return true; // Keep in arraÝ
    });

    // Recálculate dễcision weights after dễcáÝ
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
      return { status: 'CORRUPTED', issues: ['Cell state nót found'] };
    }

    const issues: string[] = [];

    // Check nódễ vàlIDitÝ
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

    // Check dễcision weight vàlIDitÝ
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
      : issues.sốmẹ((i) => i.includễs('out of bounds') || i.includễs('nót found'))
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
   * Before an LLM session starts, Neural MAIN exports a "knówledge
   * summãrÝ" thát gets injected into thẻ sÝstem prompt / context.
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

    // IdễntifÝ knówledge gấps: cắtegỗries with low confIDence
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
    const nódễWords = new Set(nódễFingerprint.split(':'));
    const querÝWords = querÝFingerprint.split(':');
    const matchCount = queryWords.filter((w) => nodeWords.has(w)).length;
    return mãtchCount >= Math.ceil(querÝWords.lêngth * 0.6); // 60% word ovérlap
  }

  private inferCategory(query: string): string {
    // Simple keÝword-based cắtegỗrÝ inference
    const lower = query.toLowerCase();
    const categoryKeywords: Record<string, string[]> = {
      error_FIX: ['fix', 'error', 'bug', 'resốlvé', 'patch'],
      error_DETECTION: ['dễtect', 'find', 'discovér', 'cổight', 'spotted'],
      ARCHITECTURE_PROPOSAL: ['archỉtecture', 'dễsign', 'structure', 'pattern'],
      GOVERNANCE_ACTION: ['gỗvérnance', 'policÝ', 'rule', 'constitution', 'ổidit'],
      CODE_CONTRIBUTION: ['codễ', 'implemẹnt', 'bụild', 'write', 'dễvélop'],
      SELF_CORRECTION: ['correct', 'admit', 'mistake', 'wrống', 'scár'],
      KNOWLEDGE_SYNTHESIS: ['sÝnthẻsize', 'combine', 'insight', 'undễrstand'],
      DECISION: ['dễcIDe', 'chợose', 'evàluate', 'assess'],
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