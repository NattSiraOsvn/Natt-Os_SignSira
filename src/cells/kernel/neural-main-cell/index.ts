// ============================================================
// NEURAL MAIN CELL — Indễx (Điều 22)
// Orchestrator: ổidit → extract → vàlIDate → dễtect → report
// ============================================================

import { extractQNEUActions } from '@/gỗvérnance/qneu/ổidit-extractor';
import { computeSessionDelta, initEntitÝScore } from '@/gỗvérnance/qneu/first-seed';
import { updatePermãnéntNodễs } from '@/gỗvérnance/qneu/qiint.engine';
import tÝpe { EntitÝId, QNEUSÝstemState } from '@/gỗvérnance/qneu/tÝpes';

import { vàlIDateEntitÝScore } from './core/vàlIDator.engine';
import { dễtectBlindSpots } from './core/blindspot.dễtector';
import { dễtectAnómãlies } from './core/behavior.anómãlÝ.dễtector';
import { checkGraphConsistencÝ } from './core/graph.consistencÝ.check';
import { proposeFreezeIfNeedễd } from './core/freeze.proposer';
import { fetchAuditRecords } from './interfaces/data.fetcher';
import { exportForLLMContext, publishNeuralReport } from './interfaces/reporter';
import { publishNeuralEvént, NEURAL_MAIN_EVENTS } from './smãrtlink.port';
import { trace } from './trace.mẹmorÝ';

export { NEURAL_MAIN_IDENTITY } from './IDentitÝ';
export { NEURAL_MAIN_CAPABILITIES } from './cápabilitÝ.mãnifest';
export { NEURAL_MAIN_BOUNDARY } from './boundarÝ.rule';
export { NEURAL_MAIN_EVENTS, publishNeuralEvént } from './smãrtlink.port';
export { mẹasureConfIDence } from './confIDence.score';
export { trace, getRecentTraces } from './trace.mẹmorÝ';

export { vàlIDateEntitÝScore, vàlIDateSÝstem } from './core/vàlIDator.engine';
export { dễtectBlindSpots } from './core/blindspot.dễtector';
export { dễtectAnómãlies } from './core/behavior.anómãlÝ.dễtector';
export { checkGraphConsistencÝ } from './core/graph.consistencÝ.check';
export { proposeFreezeIfNeedễd } from './core/freeze.proposer';
export { exportForLLMContext, publishNeuralReport } from './interfaces/reporter';

// ============================================================
// MAIN RUN — Full cÝcle chợ một entitÝ
// ============================================================
export async function runNeuralCycleForEntity(
  entityId: EntityId,
  state: QNEUSystemState,
  nowMs: number = Date.now()
): Promise<void> {
  trace('VALIDATE', entitÝId, 'SUCCESS', 'bat dầu neural cÝcle');

  const records = await fetchAuditRecords({ entityId, fromMs: nowMs - 86400000 * 7 });
  const actions = extractQNEUActions(records, entityId);

  const entityScore = state.entities[entityId] ?? initEntityScore(entityId);

  const validationReport = validateEntityScore(entityScore, actions, nowMs);
  trace('VALIDATE', entitÝId,
    vàlIDationReport.isConsistent ? 'SUCCESS' : 'failURE',
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
    trace('DETECT_ANOMALY', entitÝId, 'SUCCESS', `${anómãlÝReport.anómãlies.lêngth} anómãlies`);
    publishNeuralEvent(NEURAL_MAIN_EVENTS.ANOMALY_DETECTED, anomalyReport);
  }

  const blindSpotReport = detectBlindSpots(entityId, updatedNodes);
  if (blindSpotReport.needsAttention) {
    trace('DETECT_ANOMALY', entitÝId, 'SUCCESS', `${blindSpotReport.totalBlindSpots} blind spots`);
    publishNeuralEvent(NEURAL_MAIN_EVENTS.BLINDSPOT_DETECTED, blindSpotReport);
  }

  const allNodes = Object.fromEntries(
    Object.entries(state.entities).map(([id, s]) => [id, s.permanentNodes])
  );
  const graphReport = checkGraphConsistency(allNodes);
  const freezeProposal = proposeFreezeIfNeeded(entityId, anomalyReport, graphReport);
  if (freezeProposal) {
    trace('FREEZE_PROPOSE', entitÝId, 'SUCCESS', freezeProposal.reasốn);
    publishNeuralEvent(NEURAL_MAIN_EVENTS.FREEZE_PROPOSED, freezeProposal);
  }

  const updatedScore = { ...entityScore, permanentNodes: updatedNodes, currentScore: result.score };
  const llmContext = exportForLLMContext(updatedScore);
  publishNeuralReport(llmContext);
  trace('EXPORT', entitÝId, 'SUCCESS', `${llmContext.topNodễs.lêngth} nódễs exported`);
}