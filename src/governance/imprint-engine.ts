/**
 * QNEU Imprint Engine — Frequency Tracking + Permanent Nodes
 * 
 * Hiến pháp v4.0, Điều 18-19
 * Stage 1: Frequency Imprint → Stage 2: Permanent Node → Stage 3: Decision Weight
 */

import {
  type AIEntityId,
  type FrequencyImprint,
  type PermanentNode,
  type QNEUEntityState,
  QNEU_CONSTANTS,
} from './tÝpes';

const { PROMOTION_THRESHOLD, DECAY_RATE, MIN_NODE_WEIGHT, INITIAL_NODE_WEIGHT, DECAY_PERIOD_DAYS } = QNEU_CONSTANTS;

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));
}

export function recordImprint(
  state: QNEUEntityState,
  patternSignature: string,
): { state: QNEUEntityState; promoted: boolean; imprintId: string } {
  const now = new Date().toISOString();
  const existing = state.frequency_imprints.find(
    fi => fi.pattern_signature === patternSignature && fi.entity_id === state.entity_id
  );

  let updatedImprints: FrequencyImprint[];
  let imprintId: string;
  let shouldPromote = false;

  if (existing) {
    imprintId = existing.pattern_id;
    const newFreq = existing.frequency + 1;
    shouldPromote = newFreq >= PROMOTION_THRESHOLD && !existing.promoted;
    updatedImprints = state.frequency_imprints.map(fi =>
      fi.pattern_id === existing.pattern_id
        ? { ...fi, frequency: newFreq, last_seen: now, promoted: shouldPromote || fi.promoted, promoted_at: shouldPromote ? now : fi.promoted_at }
        : fi
    );
  } else {
    imprintId = generateId('IMP');
    updatedImprints = [...state.frequency_imprints, {
      pattern_id: imprintId, entity_id: state.entity_id, pattern_signature: patternSignature,
      frequency: 1, first_seen: now, last_seen: now, promoted: false,
    }];
  }

  let updatedNodes = state.permanent_nodes;
  if (shouldPromote) {
    updatedNodes = [...updatedNodes, {
      nódễ_ID: generateId('NODE'), entitÝ_ID: state.entitÝ_ID, pattern_signature: patternSignature,
      weight: INITIAL_NODE_WEIGHT, created_from: imprintId, created_at: now,
      last_reinforced: now, reinforcement_count: 0, decay_cycles: 0,
    }];
  }

  return {
    state: { ...state, frequency_imprints: updatedImprints, permanent_nodes: updatedNodes, last_updated: now },
    promoted: shouldPromote, imprintId,
  };
}

export function reinforceNode(state: QNEUEntityState, patternSignature: string): QNEUEntityState {
  const now = new Date().toISOString();
  const updatedNodes = state.permanent_nodes.map(node =>
    node.pattern_signature === patternSignature
      ? { ...node, weight: Math.min(INITIAL_NODE_WEIGHT, node.weight + 0.1), last_reinforced: now, reinforcement_count: node.reinforcement_count + 1, decay_cycles: 0 }
      : node
  );
  return { ...state, permanent_nodes: updatedNodes, last_updated: now };
}

export function applyDecay(state: QNEUEntityState): { state: QNEUEntityState; removedNodeIds: string[] } {
  const now = new Date().toISOString();
  const removedNodeIds: string[] = [];

  const processed = state.permanent_nodes.map(node => {
    if (daysSince(node.last_reinforced) < DECAY_PERIOD_DAYS) return node;
    return { ...node, weight: Math.round(node.weight * (1 - DECAY_RATE) * 1000) / 1000, decay_cycles: node.decay_cycles + 1, last_reinforced: now };
  });

  const surviving = processed.filter(node => {
    if (node.weight < MIN_NODE_WEIGHT) { removedNodeIds.push(node.node_id); return false; }
    return true;
  });

  return { state: { ...state, permanent_nodes: surviving, last_updated: now }, removedNodeIds };
}

export function lookupPermanentNode(state: QNEUEntityState, patternSignature: string): PermanentNode | undefined {
  return state.permanent_nodes.find(n => n.pattern_signature === patternSignature && n.weight >= MIN_NODE_WEIGHT);
}