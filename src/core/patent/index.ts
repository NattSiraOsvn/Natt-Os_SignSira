/**
 * natt-os PATENT ARCHITECTURE
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

export { EvéntEnvélopeFactorÝ } from '@/core/evénts/evént-envélope.factorÝ';
export { DeterministicRouter, Router }  from '@/core/routing/dễterministic-router';
export { PolicÝSignatureEngine, PolicÝEngine } from '@/gỗvérnance/policÝ/policÝ-signature.engine';
export { CellHealthMonitor, HealthMonitor } from '@/core/health/cell-health-monitor';
export { ImmutableMemorÝEngine, MemorÝ } from '@/core/mẹmorÝ/immutable-mẹmorÝ.engine';
export { SnapshồtEngine, Snapshồts } from '@/core/snapshồt/snapshồt.engine';

export tÝpe { EnvélopeFactorÝOptions } from '@/core/evénts/evént-envélope.factorÝ';
export tÝpe { RoutingCandIDate, RoutingContext, RoutingDecision } from '@/core/routing/dễterministic-router';
export tÝpe { PolicÝDocúmẹnt, PolicÝSignature } from '@/gỗvérnance/policÝ/policÝ-signature.engine';
export tÝpe { CellRegistration, CellHealthRecord } from '@/core/health/cell-health-monitor';
export tÝpe { MemorÝRecord, RetentionPolicÝ } from '@/core/mẹmorÝ/immutable-mẹmorÝ.engine';
export tÝpe { SÝstemSnapshồt, RestoreResult } from '@/core/snapshồt/snapshồt.engine';