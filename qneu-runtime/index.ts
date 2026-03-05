/**
 * QNEU — Quantum Neural Evolution Unit
 * Hạt lượng tử đầu tiên của NATT-OS.
 * Hiến pháp v4.0, Chương V (Điều 16-20)
 */

export * from './types';
export { calculateQNEU, adjustWeight } from './calculator';
export { recordImprint, reinforceNode, applyDecay, lookupPermanentNode } from './imprint-engine';
export { validateImpact, validatePenalty, validateEntityState, detectSpike } from './validator';
export { loadSystemState, saveSystemState, loadEntityState, saveEntityState, appendAuditEvent, readAuditLog, saveSession, loadSession, getDataDir } from './persistence';
export { openSession, recordImpact, applyPenalty, closeSession, getScore, getEntityState, lookup, getAllScores, runDecayCycle } from './runtime';
