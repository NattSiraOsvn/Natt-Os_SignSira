/**
 * QNEU v1.1.0 — Quantum Neural Evolution Unit
 * 
 * Changes from v1.0.0:
 * - Storage interface abstraction (swap file→SQLite→PostgreSQL)
 * - Batch audit insert for performance
 * - Audit-cell SmartLink bridge (seed stage)
 * - Decay cron runner
 * - Unit tests
 */

// Types — Shared DNA
export * from './types';

// Storage Interface — for engine swapping
export type { QNEUStorageEngine, AuditQueryOptions } from './storage.interface';

// Calculator — The Formula
export { calculateQNEU, adjustWeight } from './calculator';

// Imprint Engine — Frequency → Permanent Node
export { recordImprint, reinforceNode, applyDecay, lookupPermanentNode } from './imprint-engine';

// Validator — Anti-Gaming (Điều 20)
export { validateImpact, validatePenalty, validateEntityState, detectSpike } from './validator';

// Persistence — File-based storage (implements QNEUStorageEngine)
export { FileStorageEngine, getStorageEngine, setStorageEngine, loadSystemState, saveSystemState, loadEntityState, saveEntityState, appendAuditEvent, readAuditLog, saveSession, loadSession, getDataDir } from './persistence';

// Runtime — Main orchestrator
export { openSession, recordImpact, applyPenalty, closeSession, getScore, getEntityState, lookup, getAllScores, runDecayCycle } from './runtime';

// Audit Bridge — SmartLink integration
export type { QNEUAuditBridge, AuditFilter } from './audit-bridge';
export { LocalAuditBridge } from './audit-bridge';
