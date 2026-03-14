// @ts-nocheck
/**
 * Event Causality Check
 * Kiểm tra chuỗi nhân quả của events trong hệ thống
 * Điều 6: No audit = doesn't exist
 */

export interface CausalityNode {
  eventId: string;
  eventType: string;
  sourceCell: string;
  targetCell?: string;
  timestamp: number;
  causedBy?: string;  // parent eventId
  children: string[]; // child eventIds
}

export interface CausalityCheckResult {
  timestamp: number;
  totalEvents: number;
  orphanEvents: number;   // events without causedBy (root events — OK)
  brokenChains: number;   // events with causedBy pointing to non-existent event
  circularRefs: number;   // A → B → A (bad)
  maxChainDepth: number;
  status: "VALID" | "BROKEN" | "CIRCULAR";
  issues: string[];
}

// In-memory causal graph (runtime)
const _causalGraph = new Map<string, CausalityNode>();

export const EventCausalityCheck = {
  /** Đăng ký event vào causal graph */
  register: (node: Omit<CausalityNode, "children">): void => {
    const existing = _causalGraph.get(node.eventId);
    if (existing) return; // idempotent

    _causalGraph.set(node.eventId, { ...node, children: [] });

    // Update parent's children list
    if (node.causedBy) {
      const parent = _causalGraph.get(node.causedBy);
      if (parent) parent.children.push(node.eventId);
    }
  },

  /** Kiểm tra toàn bộ causal graph */
  check: (): CausalityCheckResult => {
    const issues: string[] = [];
    let brokenChains = 0;
    let circularRefs = 0;
    let maxDepth = 0;

    const nodes = Array.from(_causalGraph.values());
    const orphans = nodes.filter(n => !n.causedBy).length;

    // Check broken chains
    for (const node of nodes) {
      if (node.causedBy && !_causalGraph.has(node.causedBy)) {
        brokenChains++;
        issues.push(`BROKEN: ${node.eventId} references non-existent parent ${node.causedBy}`);
      }
    }

    // Check circular refs via DFS
    const visited = new Set<string>();
    const inStack = new Set<string>();

    const dfs = (id: string, depth: number): void => {
      if (inStack.has(id)) { circularRefs++; issues.push(`CIRCULAR: detected at ${id}`); return; }
      if (visited.has(id)) return;
      visited.add(id); inStack.add(id);
      maxDepth = Math.max(maxDepth, depth);
      const node = _causalGraph.get(id);
      if (node) node.children.forEach(c => dfs(c, depth + 1));
      inStack.delete(id);
    };

    nodes.filter(n => !n.causedBy).forEach(n => dfs(n.eventId, 0));

    let status: CausalityCheckResult["status"] = "VALID";
    if (circularRefs > 0) status = "CIRCULAR";
    else if (brokenChains > 0) status = "BROKEN";

    return {
      timestamp: Date.now(),
      totalEvents: nodes.length,
      orphanEvents: orphans,
      brokenChains,
      circularRefs,
      maxChainDepth: maxDepth,
      status,
      issues,
    };
  },

  /** Clear graph (test/reset) */
  clear: (): void => _causalGraph.clear(),

  /** Size */
  size: (): number => _causalGraph.size,
};

export default EventCausalityCheck;
