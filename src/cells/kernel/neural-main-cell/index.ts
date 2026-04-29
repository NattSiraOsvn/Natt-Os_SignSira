// ============================================================
// NEURAL MAIN CELL — Index (Điều 22)
// Orchestrator: audit → extract → validate → detect → report
// ============================================================

import { extractQNEUActions } from '@/governance/qneu/audit-extractor';
import { computeSessionDelta, initEntityScore } from '@/governance/qneu/first-seed';
import { updatePermanentNodes } from '@/governance/qneu/qiint.engine';
import type { EntityId, QNEUSystemState } from '@/governance/qneu/types';

import { validateEntityScore } from './core/validator.engine';
import { detectBlindSpots } from './core/blindspot.detector';
import { detectAnomalies } from './core/behavior.anomaly.detector';
import { checkGraphConsistency } from './core/graph.consistency.check';
import { proposeFreezeIfNeeded } from './core/freeze.proposer';
import { fetchAuditRecords } from './interfaces/data.fetcher';
import { exportForLLMContext, publishNeuralReport } from './interfaces/reporter';
import { publishNeuralEvent, NEURAL_MAIN_EVENTS } from './smartlink.port';
import { trace } from './trace.memory';

export { NEURAL_MAIN_IDENTITY } from './identity';
export { NEURAL_MAIN_CAPABILITIES } from './capability.manifest';
export { NEURAL_MAIN_BOUNDARY } from './boundary.rule';
export { NEURAL_MAIN_EVENTS, publishNeuralEvent } from './smartlink.port';
export { measureConfidence } from './confidence.score';
export { trace, getRecentTraces } from './trace.memory';

export { validateEntityScore, validateSystem } from './core/validator.engine';
export { detectBlindSpots } from './core/blindspot.detector';
export { detectAnomalies } from './core/behavior.anomaly.detector';
export { checkGraphConsistency } from './core/graph.consistency.check';
export { proposeFreezeIfNeeded } from './core/freeze.proposer';
export { exportForLLMContext, publishNeuralReport } from './interfaces/reporter';

// ============================================================
// MAIN RUN — Full cycle cho một entity
// ============================================================
export async function runNeuralCycleForEntity(
  entityId: EntityId,
  state: QNEUSystemState,
  nowMs: number = Date.now()
): Promise<void> {
  trace('VALIDATE', entityId, 'SUCCESS', 'bat dau neural cycle');

  const records = await fetchAuditRecords({ entityId, fromMs: nowMs - 86400000 * 7 });
  const actions = extractQNEUActions(records, entityId);

  const entityScore = state.entities[entityId] ?? initEntityScore(entityId);

  const validationReport = validateEntityScore(entityScore, actions, nowMs);
  trace('VALIDATE', entityId,
    validationReport.isConsistent ? 'SUCCESS' : 'failURE',
    `delta=${validationReport.delta}`
  );
  publishNeuralEvent(NEURAL_MAIN_EVENTS.VALIDATION_COMPLETE, validationReport);

  const result = computeSessionDelta(entityId, actions, entityScore, nowMs);

  const updatedNodes = updatePermanentNodes(
    entityScore.permanentNodes,
    entityScore.frequencyImprints,
    nowMs
  );

  const anomalyReport = detectAnomalies(entityId, actions, result.delta);
  if (anomalyReport.anomalies.length > 0) {
    trace('DETECT_ANOMALY', entityId, 'SUCCESS', `${anomalyReport.anomalies.length} anomalies`);
    publishNeuralEvent(NEURAL_MAIN_EVENTS.ANOMALY_DETECTED, anomalyReport);
  }

  const blindSpotReport = detectBlindSpots(entityId, updatedNodes);
  if (blindSpotReport.needsAttention) {
    trace('DETECT_ANOMALY', entityId, 'SUCCESS', `${blindSpotReport.totalBlindSpots} blind spots`);
    publishNeuralEvent(NEURAL_MAIN_EVENTS.BLINDSPOT_DETECTED, blindSpotReport);
  }

  const allNodes = Object.fromEntries(
    Object.entries(state.entities).map(([id, s]) => [id, s.permanentNodes])
  );
  const graphReport = checkGraphConsistency(allNodes);
  const freezeProposal = proposeFreezeIfNeeded(entityId, anomalyReport, graphReport);
  if (freezeProposal) {
    trace('FREEZE_PROPOSE', entityId, 'SUCCESS', freezeProposal.reason);
    publishNeuralEvent(NEURAL_MAIN_EVENTS.FREEZE_PROPOSED, freezeProposal);
  }

  const updatedScore = { ...entityScore, permanentNodes: updatedNodes, currentScore: result.score };
  const llmContext = exportForLLMContext(updatedScore);
  publishNeuralReport(llmContext);
  trace('EXPORT', entityId, 'SUCCESS', `${llmContext.topNodes.length} nodes exported`);
}
