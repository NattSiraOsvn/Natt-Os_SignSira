/**
 * QNEU Unit Tests
 * 
 * Chạy: npx tsx src/governance/qneu/qneu.test.ts
 * 
 * Tests:
 * 1. Calculator formula correctness
 * 2. Anti-spike clamp (Điều 20)
 * 3. Diminishing weight factor
 * 4. Memory decay (Điều 19)
 * 5. Validator anti-gaming
 * 6. Imprint → promotion flow
 */

import { calculateQNEU, adjustWeight } from './calculator';
import { recordImprint, applyDecay, lookupPermanentNode } from './imprint-engine';
import { validateImpact, validatePenalty, detectSpike } from './validator';
import type { Impact, Penalty, QNEUEntityState } from './types';
import { QNEU_CONSTANTS } from './types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string): void {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${name}`);
    failed++;
  }
}

function assertClose(actual: number, expected: number, name: string, tolerance = 0.01): void {
  assert(Math.abs(actual - expected) < tolerance, `${name} (got ${actual}, expected ${expected})`);
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  QNEU UNIT TESTS');
console.log('═══════════════════════════════════════════════════════════════');

// ═══════════════════════════════════════════
// TEST 1: Calculator — Basic formula
// ═══════════════════════════════════════════
console.log('');
console.log('  ▸ Calculator');

const basicImpacts: Impact[] = [
  { id: 'i1', category: 'BUG_FIX', description: 'test', raw_weight: 50, frequency_count: 1, adjusted_weight: 50, timestamp: '', verified_by: 'AUDIT_TRAIL' },
  { id: 'i2', category: 'SPEC_CREATION', description: 'test', raw_weight: 30, frequency_count: 1, adjusted_weight: 30, timestamp: '', verified_by: 'GATEKEEPER' },
];
const basicPenalties: Penalty[] = [
  { id: 'p1', category: 'HIDE_ERROR', description: 'test hide', weight: -10, timestamp: '', verified_by: 'AUDIT_TRAIL' },
];

const score1 = calculateQNEU('BANG', 100, basicImpacts, basicPenalties, 'ses-1');
// 100 + 50 + 30 - 10 = 170
assert(score1.final_score === 170, 'Basic: 100 + 50 + 30 - 10 = 170');
assert(score1.impacts_total === 80, 'Impacts total = 80');
assert(score1.penalties_total === 10, 'Penalties total = 10');

// ═══════════════════════════════════════════
// TEST 2: Anti-spike clamp
// ═══════════════════════════════════════════
console.log('');
console.log('  ▸ Anti-spike clamp');

const bigImpacts: Impact[] = [
  { id: 'i1', category: 'BUG_FIX', description: 'huge', raw_weight: 100, frequency_count: 1, adjusted_weight: 100, timestamp: '', verified_by: 'AUDIT_TRAIL' },
  { id: 'i2', category: 'SPEC_CREATION', description: 'huge2', raw_weight: 100, frequency_count: 1, adjusted_weight: 100, timestamp: '', verified_by: 'AUDIT_TRAIL' },
  { id: 'i3', category: 'CELL_CREATION', description: 'huge3', raw_weight: 100, frequency_count: 1, adjusted_weight: 100, timestamp: '', verified_by: 'AUDIT_TRAIL' },
  { id: 'i4', category: 'AUDIT_DISCOVERY', description: 'huge4', raw_weight: 100, frequency_count: 1, adjusted_weight: 100, timestamp: '', verified_by: 'AUDIT_TRAIL' },
];

const spikeScore = calculateQNEU('KIM', 0, bigImpacts, [], 'ses-2', 0);
// Raw: 0 + 400 = 400. Clamped: 0 + 300 = 300
assert(spikeScore.final_score === 300, `Anti-spike: 400 raw clamped to 300 (got ${spikeScore.final_score})`);

const noClampScore = calculateQNEU('KIM', 200, bigImpacts, [], 'ses-3');
// No previousScore → no clamp
assert(noClampScore.final_score === 600, `No prev score → no clamp: 200 + 400 = 600 (got ${noClampScore.final_score})`);

// ═══════════════════════════════════════════
// TEST 3: Diminishing weight factor
// ═══════════════════════════════════════════
console.log('');
console.log('  ▸ Diminishing weight');

assertClose(adjustWeight(100, 1), 100, '1st occurrence: 100 × 0.85^0 = 100');
assertClose(adjustWeight(100, 2), 85, '2nd occurrence: 100 × 0.85^1 = 85');
assertClose(adjustWeight(100, 3), 72.25, '3rd occurrence: 100 × 0.85^2 = 72.25');
assertClose(adjustWeight(100, 5), 52.2, '5th occurrence: 100 × 0.85^4 ≈ 52.2', 0.1);

// ═══════════════════════════════════════════
// TEST 4: Imprint → Promotion flow
// ═══════════════════════════════════════════
console.log('');
console.log('  ▸ Imprint → Promotion');

const emptyState: QNEUEntityState = {
  entity_id: 'BANG',
  current_score: 0,
  frequency_imprints: [],
  permanent_nodes: [],
  total_sessions: 0,
  total_impacts: 0,
  total_penalties: 0,
  last_updated: new Date().toISOString(),
};

// Record same pattern 4 times — should NOT promote yet
let state = emptyState;
for (let i = 0; i < 4; i++) {
  const result = recordImprint(state, 'scaffold-not-implementation');
  state = result.state;
  if (i < 3) assert(!result.promoted, `Imprint ${i + 1}: not promoted yet`);
}
assert(state.permanent_nodes.length === 0, 'After 4 imprints: 0 permanent nodes');

// 5th time — should promote
const fifthResult = recordImprint(state, 'scaffold-not-implementation');
state = fifthResult.state;
assert(fifthResult.promoted, '5th imprint: PROMOTED');
assert(state.permanent_nodes.length === 1, 'After 5 imprints: 1 permanent node');
assert(state.permanent_nodes[0].weight === 1.0, 'New node weight = 1.0');

// Lookup should find it
const found = lookupPermanentNode(state, 'scaffold-not-implementation');
assert(found !== undefined, 'lookupPermanentNode finds promoted node');

const notFound = lookupPermanentNode(state, 'some-other-pattern');
assert(notFound === undefined, 'lookupPermanentNode returns undefined for unknown pattern');

// ═══════════════════════════════════════════
// TEST 5: Memory decay
// ═══════════════════════════════════════════
console.log('');
console.log('  ▸ Memory decay');

// Create a state with old permanent node (last reinforced 100 days ago)
const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
const stateWithOldNode: QNEUEntityState = {
  ...emptyState,
  permanent_nodes: [{
    node_id: 'old-node',
    entity_id: 'BANG',
    pattern_signature: 'old-pattern',
    weight: 0.5,
    created_from: 'IMP-old',
    created_at: oldDate,
    last_reinforced: oldDate,
    reinforcement_count: 3,
    decay_cycles: 0,
  }],
};

const decayResult = applyDecay(stateWithOldNode);
assert(decayResult.state.permanent_nodes.length === 1, 'Decay: node survives (0.5 × 0.9 = 0.45 > 0.1)');
assertClose(decayResult.state.permanent_nodes[0]?.weight ?? 0, 0.45, 'Decay: weight 0.5 → 0.45');

// Create near-death node
const nearDeathState: QNEUEntityState = {
  ...emptyState,
  permanent_nodes: [{
    node_id: 'dying-node',
    entity_id: 'BANG',
    pattern_signature: 'dying-pattern',
    weight: 0.09,
    created_from: 'IMP-dying',
    created_at: oldDate,
    last_reinforced: oldDate,
    reinforcement_count: 0,
    decay_cycles: 5,
  }],
};

const deathResult = applyDecay(nearDeathState);
assert(deathResult.removedNodeIds.length === 1, 'Decay: near-death node (0.09) REMOVED');
assert(deathResult.state.permanent_nodes.length === 0, 'Decay: permanent nodes now empty');

// Fresh node should NOT decay
const freshState: QNEUEntityState = {
  ...emptyState,
  permanent_nodes: [{
    node_id: 'fresh-node',
    entity_id: 'BANG',
    pattern_signature: 'fresh-pattern',
    weight: 1.0,
    created_from: 'IMP-fresh',
    created_at: new Date().toISOString(),
    last_reinforced: new Date().toISOString(),
    reinforcement_count: 0,
    decay_cycles: 0,
  }],
};

const freshResult = applyDecay(freshState);
assert(freshResult.state.permanent_nodes[0]?.weight === 1.0, 'Decay: fresh node untouched');

// ═══════════════════════════════════════════
// TEST 6: Validator anti-gaming
// ═══════════════════════════════════════════
console.log('');
console.log('  ▸ Validator anti-gaming');

const validImpact: Impact = {
  id: 'i-valid', category: 'BUG_FIX', description: 'Fixed real bug',
  raw_weight: 50, frequency_count: 1, adjusted_weight: 50,
  timestamp: '', verified_by: 'AUDIT_TRAIL',
};
assert(validateImpact(validImpact).valid, 'Valid impact passes');

const selfReportImpact = { ...validImpact, verified_by: 'SELF_REPORT' as any };
assert(!validateImpact(selfReportImpact).valid, 'SELF_REPORT rejected');

const peerOnlyImpact = { ...validImpact, verified_by: 'PEER_ATTESTATION_ONLY' as any };
assert(!validateImpact(peerOnlyImpact).valid, 'PEER_ATTESTATION_ONLY rejected');

const overweightImpact = { ...validImpact, raw_weight: 150 };
assert(!validateImpact(overweightImpact).valid, 'Weight > 100 rejected');

const emptyDescImpact = { ...validImpact, description: '' };
assert(!validateImpact(emptyDescImpact).valid, 'Empty description rejected');

const validPenalty: Penalty = {
  id: 'p-valid', category: 'HIDE_ERROR', description: 'Hid errors',
  weight: -20, timestamp: '', verified_by: 'AUDIT_TRAIL',
};
assert(validatePenalty(validPenalty).valid, 'Valid penalty passes');

const positivePenalty = { ...validPenalty, weight: 20 };
assert(!validatePenalty(positivePenalty).valid, 'Positive penalty weight rejected');

assert(detectSpike(400, 50), 'Spike detected: 50 → 400 (Δ350 > 300)');
assert(!detectSpike(300, 50), 'No spike: 50 → 300 (Δ250 < 300)');

// ═══════════════════════════════════════════
// RESULTS
// ═══════════════════════════════════════════
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('  ✅ ALL TESTS PASSED');
} else {
  console.log('  ❌ SOME TESTS FAILED');
  process.exit(1);
}
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
