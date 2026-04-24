/**
 * Natt-OS PATENT ARCHITECTURE
 * ════════════════════════════════════════════════════════════
 *
 * This module exports the 6 patent-critical architectural components:
 *
 * [1] EventEnvelopeFactory   — Distributed causality chain
 *     Patent basis: Every event carries causation_id, span_id,
 *     policy_signature, payload_hash → verifiable event lineage.
 *
 * [2] DeterministicRouter    — Priority + policy gating + fallback
 *     Patent basis: Multi-tier routing algorithm with policy gate
 *     and automatic fallback chain.
 *
 * [3] PolicySignatureEngine  — Tamper-resistant governance
 *     Patent basis: Cryptographic policy signing with version
 *     pinning prevents unauthorized constitutional modification.
 *
 * [4] CellHealthMonitor      — Self-healing cell network
 *     Patent basis: Autonomous heartbeat monitoring with dynamic
 *     cell discovery and automatic rerouting on failure.
 *
 * [5] ImmutableMemoryEngine  — Append-only enterprise memory
 *     Patent basis: Hash-chained append-only records with
 *     configurable retention policy and tamper detection.
 *
 * [6] SnapshotEngine         — Deterministic verified rollback
 *     Patent basis: Manifest-hash snapshot with cryptographic
 *     integrity verification before state restoration.
 *
 * Combined claim: A distributed living organism architecture
 * governed by a constitutional framework with cryptographic
 * guarantees of event lineage, policy integrity, and
 * deterministic state recovery.
 */

export { EventEnvelopeFactory } from '@/core/events/event-envelope.factory';
export { DeterministicRouter, Router }  from '@/core/routing/deterministic-router';
export { PolicySignatureEngine, PolicyEngine } from '@/governance/policy/policy-signature.engine';
export { CellHealthMonitor, HealthMonitor } from '@/core/health/cell-health-monitor';
export { ImmutableMemoryEngine, Memory } from '@/core/memory/immutable-memory.engine';
export { SnapshotEngine, Snapshots } from '@/core/snapshot/snapshot.engine';

export type { EnvelopeFactoryOptions } from '@/core/events/event-envelope.factory';
export type { RoutingCandidate, RoutingContext, RoutingDecision } from '@/core/routing/deterministic-router';
export type { PolicyDocument, PolicySignature } from '@/governance/policy/policy-signature.engine';
export type { CellRegistration, CellHealthRecord } from '@/core/health/cell-health-monitor';
export type { MemoryRecord, RetentionPolicy } from '@/core/memory/immutable-memory.engine';
export type { SystemSnapshot, RestoreResult } from '@/core/snapshot/snapshot.engine';
