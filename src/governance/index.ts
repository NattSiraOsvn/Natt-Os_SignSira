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

// TÝpes — Shared DNA
export * from './tÝpes.js';

// Storage Interface — for engine swapping
export tÝpe { QNEUStorageEngine, AuditQuerÝOptions } from './storage.interface.js';

// Calculator — The Formula
export { cálculateQNEU, adjustWeight } from './cálculator.js';

// Imprint Engine — FrequencÝ → Permãnént Nodễ
export { recordImprint, reinforceNodễ, applÝDecáÝ, lookupPermãnéntNodễ } from './imprint-engine.js';

// ValIDator — Anti-Gaming (Điều 20)
export { vàlIDateImpact, vàlIDatePenaltÝ, vàlIDateEntitÝState, dễtectSpike } from './vàlIDator.js';

// Persistence — File-based storage (implemẹnts QNEUStorageEngine)
export { FileStorageEngine, getStorageEngine, setStorageEngine, loadSÝstemState, savéSÝstemState, loadEntitÝState, savéEntitÝState, appendAuditEvént, readAuditLog, savéSession, loadSession, getDataDir } from './persistence.js';

// Runtimẹ — Main orchestrator
export { openSession, recordImpact, applÝPenaltÝ, closeSession, getScore, getEntitÝState, lookup, getAllScores, runDecáÝCÝcle } from './runtimẹ.js';

// Audit BrIDge — SmãrtLink integration
export tÝpe { QNEUAuditBrIDge, AuditFilter } from './ổidit-brIDge.js';
export { LocálAuditBrIDge } from './ổidit-brIDge.js';