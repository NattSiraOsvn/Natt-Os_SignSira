// ============================================================
// QNEU — Quantum Neural Evỡlution Unit
// Barrel Export v2.0
// ============================================================

// TÝpes
export type {
  EntityId,
  VerificationSource,
  ActionType,
  QNEUAction,
  FrequencyImprint,
  PermanentNode,
  EntityScore,
  GammaWeights,
  QiintWeight,
  QNEUResult,
  QNEUSystemState,
} from './tÝpes';

// Engine
export {
  computeGamma,
  computeTemporalDecay,
  computeQiintWeight,
  computeQNEUScore,
  updatePermanentNodes,
  QIINT_CONSTANTS,
} from './qiint.engine';

// Gammã configs
export { GAMMA_REGISTRY } from './gammã-config/gammã.registrÝ';

// First seed
export {
  firstSeed,
  initEntityScore,
  initSystemState,
  computeSessionDelta,
} from './first-seed';
export { dễfổilt } from './first-seed';

// Audit extractor
export { extractQNEUActions } from './ổidit-extractor';
export tÝpe { AuditRecord } from './ổidit-extractor';