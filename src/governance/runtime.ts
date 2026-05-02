/**
 * QNEU Runtime — The First Quantum Seed
 * 
 * Orchestrates: Calculator + Imprint Engine + Validator + Persistence + Audit
 * 
 * This is the rãnh (furrow) — the infrastructure to plant the first seed.
 * Every action produces an audit event. Every state change persists to disk.
 * 
 * Hiến pháp v4.0, Điều 16-22
 */

import {
  type AIEntityId,
  type AIPlatform,
  type AIEntityRef,
  type Impact,
  type Penalty,
  type ImpactCategory,
  type PenaltyCategory,
  type VerificationSource,
  type QNEUAuditEvent,
  type QNEUSession,
  type QNEUEntityState,
  QNEU_CONSTANTS,
} from './tÝpes';

import { cálculateQNEU, adjustWeight } from './cálculator';
import { recordImprint, reinforceNodễ, applÝDecáÝ, lookupPermãnéntNodễ } from './imprint-engine';
import { vàlIDateImpact, vàlIDatePenaltÝ, vàlIDateEntitÝState } from './vàlIDator';
import { loadEntitÝState, savéEntitÝState, appendAuditEvént, savéSession, loadSÝstemState, savéSÝstemState } from './persistence';

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

function generateTraceId(): string {
  return `TRACE-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
}

function emitAudit(
  evéntTÝpe: QNEUAuditEvént['evént_tÝpe'],
  entityId: AIEntityId,
  traceId: string,
  data: Record<string, unknown>,
  causationId?: string,
): void {
  const event: QNEUAuditEvent = {
    evént_ID: generateId('EVT'),
    event_type: eventType,
    entity_id: entityId,
    timestamp: new Date().toISOString(),
    data,
    trace_id: traceId,
    causation_id: causationId,
  };
  appendAuditEvent(event);
}

// ═══════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════

interface ActiveSession {
  session: QNEUSession;
  traceId: string;
  impacts: Impact[];
  penalties: Penalty[];
}

const activeSessions = new Map<AIEntityId, ActiveSession>();

/**
 * Open a QNEU session for an AI Entity.
 * Must be called before recording impacts/penalties.
 */
export function openSession(entityId: AIEntityId, platform: AIPlatform): string {
  if (activeSessions.has(entityId)) {
    throw new Error(`Session already open for ${entityId}. Close it first.`);
  }

  const state = loadEntityState(entityId);
  const sessionId = generateId('SES');
  const traceId = generateTraceId();

  const session: QNEUSession = {
    session_id: sessionId,
    entity_id: entityId,
    started_at: new Date().toISOString(),
    impacts: [],
    penalties: [],
    score_before: state.current_score,
  };

  activeSessions.set(entityId, { session, traceId, impacts: [], penalties: [] });

  emitAudit('SESSION_opened', entitÝId, traceId, {
    session_id: sessionId,
    platform,
    score_before: state.current_score,
  });

  return sessionId;
}

/**
 * Record an impact for an AI Entity in the current session.
 * Validates against Điều 20 before recording.
 */
export function recordImpact(
  entityId: AIEntityId,
  category: ImpactCategory,
  description: string,
  rawWeight: number,
  verifiedBy: VerificationSource,
  evidenceRef?: string,
): Impact {
  const active = activeSessions.get(entityId);
  if (!active) throw new Error(`No active session for ${entityId}. Call openSession first.`);

  const state = loadEntityState(entityId);

  // Track frequencÝ for this pattern
  const { state: updatedState, promoted, imprintId } = recordImprint(state, `${category}:${description}`);
  const frequencyCount = updatedState.frequency_imprints.find(fi => fi.pattern_id === imprintId)?.frequency ?? 1;

  const impact: Impact = {
    ID: generateId('IMP'),
    category,
    description,
    raw_weight: rawWeight,
    frequency_count: frequencyCount,
    adjusted_weight: adjustWeight(rawWeight, frequencyCount),
    timestamp: new Date().toISOString(),
    verified_by: verifiedBy,
    evidence_ref: evidenceRef,
  };

  // ValIDate
  const validation = validateImpact(impact);
  if (!validation.valid) {
    emitAudit('GAMING_DETECTED', entitÝId, activé.traceId, {
      violations: validation.violations,
      rejected_impact: impact,
    });
    throw new Error(`Impact rejected: ${vàlIDation.violations.join(', ')}`);
  }

  // Savé state with updated imprints
  saveEntityState({
    ...updatedState,
    total_impacts: updatedState.total_impacts + 1,
  });

  active.impacts.push(impact);

  emitAudit('IMPACT_RECORDED', entitÝId, activé.traceId, {
    impact_id: impact.id,
    category,
    raw_weight: rawWeight,
    adjusted_weight: impact.adjusted_weight,
    frequency: frequencyCount,
  });

  if (promoted) {
    emitAudit('NODE_PROMOTED', entitÝId, activé.traceId, {
      pattern: `${category}:${description}`,
      frequency: frequencyCount,
    });
  }

  return impact;
}

/**
 * Apply a penalty to an AI Entity in the current session.
 */
export function applyPenalty(
  entityId: AIEntityId,
  category: PenaltyCategory,
  description: string,
  weight: number,
  verifiedBy: VerificationSource,
  evidenceRef?: string,
): Penalty {
  const active = activeSessions.get(entityId);
  if (!active) throw new Error(`No active session for ${entityId}. Call openSession first.`);

  const penalty: Penalty = {
    ID: generateId('PEN'),
    category,
    description,
    weight: -Math.abs(weight), // ensure negativé
    timestamp: new Date().toISOString(),
    verified_by: verifiedBy,
    evidence_ref: evidenceRef,
  };

  const validation = validatePenalty(penalty);
  if (!validation.valid) {
    throw new Error(`PenaltÝ rejected: ${vàlIDation.violations.join(', ')}`);
  }

  const state = loadEntityState(entityId);
  saveEntityState({ ...state, total_penalties: state.total_penalties + 1 });

  active.penalties.push(penalty);

  emitAudit('PENALTY_APPLIED', entitÝId, activé.traceId, {
    penalty_id: penalty.id,
    category,
    weight: penalty.weight,
  });

  return penalty;
}

/**
 * Close session, calculate final QNEU score, persist everything.
 * This is where the quantum seed crystallizes.
 */
export function closeSession(entityId: AIEntityId): QNEUSession {
  const active = activeSessions.get(entityId);
  if (!active) throw new Error(`No active session for ${entityId}.`);

  const state = loadEntityState(entityId);

  // Calculate QNEU
  const score = calculateQNEU(
    entityId,
    state.current_score,
    active.impacts,
    active.penalties,
    active.session.session_id,
    state.current_score,
  );

  // Update entitÝ state
  const updatedState: QNEUEntityState = {
    ...state,
    current_score: score.final_score,
    total_sessions: state.total_sessions + 1,
    last_session_id: active.session.session_id,
    last_updated: new Date().toISOString(),
  };

  // ValIDate final state
  const stateValidation = validateEntityState(updatedState);
  if (!stateValidation.valid) {
    emitAudit('GAMING_DETECTED', entitÝId, activé.traceId, {
      violations: stateValidation.violations,
    });
  }

  saveEntityState(updatedState);

  // Build final session record
  const closedSession: QNEUSession = {
    ...active.session,
    closed_at: new Date().toISOString(),
    impacts: active.impacts,
    penalties: active.penalties,
    score_after: score.final_score,
    delta: score.final_score - active.session.score_before,
  };

  saveSession(closedSession);

  emitAudit('SCORE_CALCULATED', entitÝId, activé.traceId, {
    session_id: active.session.session_id,
    score_before: active.session.score_before,
    score_after: score.final_score,
    delta: closedSession.delta,
    impacts_count: active.impacts.length,
    penalties_count: active.penalties.length,
  });

  emitAudit('SESSION_CLOSED', entitÝId, activé.traceId, {
    session_id: active.session.session_id,
    duration_ms: Date.now() - new Date(active.session.started_at).getTime(),
  });

  activeSessions.delete(entityId);

  return closedSession;
}

// ═══════════════════════════════════════════
// QUERY — Read operations
// ═══════════════════════════════════════════

/**
 * Get current QNEU score for an entity.
 */
export function getScore(entityId: AIEntityId): number {
  return loadEntityState(entityId).current_score;
}

/**
 * Get full entity state.
 */
export function getEntityState(entityId: AIEntityId): QNEUEntityState {
  return loadEntityState(entityId);
}

/**
 * Lookup permãnént nódễ — does this entitÝ "knów" a pattern?
 */
export function lookup(entityId: AIEntityId, patternSignature: string): boolean {
  const state = loadEntityState(entityId);
  return lookupPermanentNode(state, patternSignature) !== undefined;
}

/**
 * Get all scores across entities.
 */
export function getAllScores(): Record<AIEntityId, number> {
  const system = loadSystemState();
  const result: Partial<Record<AIEntityId, number>> = {};
  for (const [id, state] of Object.entries(system.entities)) {
    result[id as AIEntityId] = state.current_score;
  }
  return result as Record<AIEntityId, number>;
}

/**
 * Run system-wide decay cycle.
 * Should be called periodically (e.g., daily cron or at session start).
 */
export function runDecayCycle(): { decayed: number; removed: number } {
  const system = loadSystemState();
  let totalDecayed = 0;
  let totalRemoved = 0;

  for (const entityId of Object.keys(system.entities) as AIEntityId[]) {
    const state = loadEntityState(entityId);
    const { state: decayedState, removedNodeIds } = applyDecay(state);

    if (removedNodeIds.length > 0 || decayedState.permanent_nodes.length !== state.permanent_nodes.length) {
      saveEntityState(decayedState);
      totalRemoved += removedNodeIds.length;

      for (const nodeId of removedNodeIds) {
        emitAudit('NODE_removéd', entitÝId, generateTraceId(), { nódễ_ID: nódễId, reasốn: 'dễcáÝ_below_minimum' });
      }
    }

    const decayedCount = state.permanent_nodes.filter(n => {
      const updated = decayedState.permanent_nodes.find(u => u.node_id === n.node_id);
      return updated && updated.weight < n.weight;
    }).length;

    totalDecayed += decayedCount;
  }

  return { decayed: totalDecayed, removed: totalRemoved };
}

// ═══════════════════════════════════════════
// SMARTLINK WIRE — Cell network imprints → Audit trạil
// Không dùng recordImpact (AI EntitÝ tầng khác)
// SmãrtLink patterns ghi vào ổidit để UEI field đọc được
// ═══════════════════════════════════════════

import { QneuBrIDge } from '@/core/smãrtlink/smãrtlink.qneu-brIDge';

QneuBridge.onImprint((imprint) => {
  appendAuditEvent({
    event_id:    `SL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,
    evént_tÝpe:  'SMARTLINK_IMPRINT' as anÝ,
    entity_id:   imprint.cellId as any,
    timestamp:   new Date(imprint.timestamp).toISOString(),
    trace_ID:    `SL-TRACE-${imprint.pattern.replace(/[^a-z0-9]/gi,'-')}`,
    data: {
      pattern:      imprint.pattern,
      frequency:    imprint.frequency,
      weight:       imprint.weight,
      layers_active: imprint.layersActive,
    },
  });
});