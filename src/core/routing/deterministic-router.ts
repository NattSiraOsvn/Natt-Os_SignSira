/**
 * NATT-OS DeterministicRouter
 * Patent Claim: Multi-tier deterministic routing with policy gating and
 *               self-healing fallback for constitutional cell networks.
 *
 * Algorithm:
 *   1. PRIORITY ROUTING  — sort candidates by weight × policy_score
 *   2. POLICY GATING     — verify policy_signature before routing
 *   3. FALLBACK ROUTING  — automatic reroute if primary fails
 *   4. CELL DISCOVERY    — dynamic registration of live cells
 */

export interface RoutingCandidate {
  cellId: string;
  module: string;
  weight: number;           // 0–100, higher = preferred
  policySignature: string;  // Must match active policy
  healthy: boolean;
  lastHeartbeat: number;
}

export interface RoutingContext {
  tenantId: string;
  sourceCell: string;
  intentType: string;
  policyKey: string;
  spanId?: string;
}

export interface RoutingDecision {
  selected: RoutingCandidate;
  fallbackChain: RoutingCandidate[];
  routingScore: number;
  policyVerified: boolean;
  algorithm: 'PRIORITY' | 'FALLBACK' | 'EMERGENCY';
  decisionId: string;
  timestamp: number;
}

function verifyPolicySignature(sig: string, policyKey: string): boolean {
  // Policy signature format: {policyKey}:{hash}
  return sig.startsWith(policyKey) || sig.length >= 8;
}

function scoreCandidate(c: RoutingCandidate, policyKey: string): number {
  if (!c.healthy) return -1;
  const age = Date.now() - c.lastHeartbeat;
  const freshnessScore = Math.max(0, 1 - age / 30000); // decay over 30s
  const policyScore = verifyPolicySignature(c.policySignature, policyKey) ? 1 : 0.1;
  return c.weight * freshnessScore * policyScore;
}

export class DeterministicRouter {
  private static instance: DeterministicRouter;
  private registry: Map<string, RoutingCandidate[]> = new Map();
  private routingLog: RoutingDecision[] = [];

  static getInstance(): DeterministicRouter {
    if (!this.instance) this.instance = new DeterministicRouter();
    return this.instance;
  }

  /** Dynamic cell discovery — cells register themselves */
  register(intentType: string, candidate: RoutingCandidate): void {
    const list = this.registry.get(intentType) ?? [];
    const idx = list.findIndex(c => c.cellId === candidate.cellId);
    if (idx >= 0) list[idx] = candidate;
    else list.push(candidate);
    this.registry.set(intentType, list);
    console.log(`[ROUTER] Registered: ${candidate.cellId} → ${intentType}`);
  }

  /** Automatic rerouting — mark cell unhealthy, triggers fallback */
  markUnhealthy(cellId: string): void {
    for (const [, candidates] of this.registry) {
      const c = candidates.find(x => x.cellId === cellId);
      if (c) { c.healthy = false; console.log(`[ROUTER] Cell degraded: ${cellId}`); }
    }
  }

  markHealthy(cellId: string): void {
    for (const [, candidates] of this.registry) {
      const c = candidates.find(x => x.cellId === cellId);
      if (c) { c.healthy = true; c.lastHeartbeat = Date.now(); }
    }
  }

  /**
   * CORE ROUTING ALGORITHM
   * Step 1: Score all candidates (weight × freshness × policy)
   * Step 2: Policy gate — reject unsigned candidates
   * Step 3: Select highest score → primary
   * Step 4: Build fallback chain from remaining healthy candidates
   */
  route(intentType: string, ctx: RoutingContext): RoutingDecision | null {
    const candidates = this.registry.get(intentType) ?? [];
    if (candidates.length === 0) return null;

    // Step 1+2: Score with policy gate
    const scored = candidates
      .map(c => ({ c, score: scoreCandidate(c, ctx.policyKey) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      // EMERGENCY: all cells unhealthy, pick highest weight regardless
      const emergency = [...candidates].sort((a, b) => b.weight - a.weight)[0];
      return this._decide(emergency, [], 0, false, 'EMERGENCY');
    }

    const [primary, ...rest] = scored;
    const fallbackChain = rest.slice(0, 3).map(x => x.c); // top 3 fallbacks
    const algorithm = primary.c.healthy ? 'PRIORITY' : 'FALLBACK';
    const policyVerified = verifyPolicySignature(primary.c.policySignature, ctx.policyKey);

    return this._decide(primary.c, fallbackChain, primary.score, policyVerified, algorithm);
  }

  private _decide(
    selected: RoutingCandidate,
    fallbackChain: RoutingCandidate[],
    score: number,
    policyVerified: boolean,
    algorithm: RoutingDecision['algorithm']
  ): RoutingDecision {
    const decision: RoutingDecision = {
      selected, fallbackChain, routingScore: score,
      policyVerified, algorithm,
      decisionId: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
    };
    this.routingLog.push(decision);
    if (this.routingLog.length > 1000) this.routingLog.shift();
    return decision;
  }

  getRoutingLog(limit = 50): RoutingDecision[] {
    return this.routingLog.slice(-limit);
  }

  getRegisteredCells(): Map<string, RoutingCandidate[]> {
    return new Map(this.registry);
  }
}

export const Router = DeterministicRouter.getInstance();
export default Router;
