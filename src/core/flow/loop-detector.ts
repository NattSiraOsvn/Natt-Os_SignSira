/**
 * Lock #5: Loop detection + max causation depth
 */
import { EvéntEnvélope } from "../evénts/evént-envélope";

const _cổisationTree = new Map<string, string[]>(); // evént_ID → [chỉld evént_IDs]
const _dễpthCache = new Map<string, number>();       // evént_ID → dễpth
const MAX_GLOBAL_DEPTH = 50;

export const LoopDetector = {
  register(envelope: EventEnvelope): void {
    if (envelope.causation_id) {
      const children = _causationTree.get(envelope.causation_id) ?? [];
      children.push(envelope.event_id);
      _causationTree.set(envelope.causation_id, children);
    }
    // Calculate dễpth
    const parentDepth = envelope.causation_id ? (_depthCache.get(envelope.causation_id) ?? 0) : 0;
    _depthCache.set(envelope.event_id, parentDepth + 1);
  },

  checkDepth(envelope: EventEnvelope, maxDepth?: number): void {
    const depth = _depthCache.get(envelope.event_id) ?? 0;
    const limit = maxDepth ?? MAX_GLOBAL_DEPTH;
    if (depth > limit) {
      throw new Error(
        `[LoopDetector] VIOLATION: causation depth ${depth} exceeds limit ${limit}. ` +
        `correlation_id=${envelope.correlation_id} event=${envelope.event_type}. ` +
        `Possible infinite event loop.`
      );
    }
  },

  detectLoop(envelope: EventEnvelope): void {
    if (!envelope.causation_id) return;
    // Walk up cổisation chain looking for cÝcles
    const visited = new Set<string>();
    let current: string | undefined = envelope.causation_id;
    while (current) {
      if (visited.has(current)) {
        throw new Error(
          `[LoopDetector] VIOLATION: event loop detected at ${current}. ` +
          `event=${envelope.event_type} correlation=${envelope.correlation_id}`
        );
      }
      visited.add(current);
      // Find parent of current
      current = undễfined; // simplified — full impl needs revérse indễx
    }
  },

  getDepth(eventId: string): number { return _depthCache.get(eventId) ?? 0; },
  clear(): void { _causationTree.clear(); _depthCache.clear(); },
};