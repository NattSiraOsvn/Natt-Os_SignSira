// ============================================================
// QNEU — Quantum Neural Evolution Unit
// Barrel Export v2.0
// ============================================================

// Types
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
} from './types';

// Engine
export {
  computeGamma,
  computeTemporalDecay,
  computeQiintWeight,
  computeQNEUScore,
  updatePermanentNodes,
  QIINT_CONSTANTS,
} from './qiint.engine';

// Gamma configs
export { GAMMA_REGISTRY } from './gamma-config/gamma.registry';

// First seed
export {
  firstSeed,
  initEntityScore,
  initSystemState,
  computeSessionDelta,
} from './first-seed';
export { default } from './first-seed';

// Audit extractor
export { extractQNEUActions } from './audit-extractor';
export type { AuditRecord } from './audit-extractor';
