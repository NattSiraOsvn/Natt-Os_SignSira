/**
 * QNEU Persistence — File-based JSON Storage
 * 
 * First seed: simple file-based persistence.
 * Future: migrate to SQLite/PostgreSQL when ready.
 * 
 * Storage structure:
 *   src/governance/qneu/data/
 *   ├── system-state.json      (QNEUSystemState)
 *   ├── audit-log.jsonl        (append-only audit events, one JSON per line)
 *   └── sessions/
 *       └── {session_id}.json  (QNEUSession)
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  type AIEntityId,
  type QNEUSystemState,
  type QNEUEntityState,
  type QNEUAuditEvent,
  type QNEUSession,
  QNEU_CONSTANTS,
} from './types';

const DATA_DIR = path.resolve(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'system-state.json');
const AUDIT_LOG = path.join(DATA_DIR, 'audit-log.jsonl');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');

// ═══════════════════════════════════════════
// INIT — Create data directory if needed
// ═══════════════════════════════════════════

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// ═══════════════════════════════════════════
// SYSTEM STATE — Read/Write
// ═══════════════════════════════════════════

const DEFAULT_ENTITY_STATE: Omit<QNEUEntityState, 'entity_id'> = {
  current_score: 0,
  frequency_imprints: [],
  permanent_nodes: [],
  total_sessions: 0,
  total_impacts: 0,
  total_penalties: 0,
  last_updated: new Date().toISOString(),
};

function createDefaultSystemState(): QNEUSystemState {
  const entities: Record<string, QNEUEntityState> = {};
  const entityIds: AIEntityId[] = ['KIM', 'BANG', 'BOI_BOI', 'THIEN', 'CAN'];
  
  for (const id of entityIds) {
    entities[id] = { entity_id: id, ...DEFAULT_ENTITY_STATE };
  }

  return {
    version: QNEU_CONSTANTS.VERSION,
    entities: entities as Record<AIEntityId, QNEUEntityState>,
    audit_events_count: 0,
    last_updated: new Date().toISOString(),
  };
}

export function loadSystemState(): QNEUSystemState {
  ensureDataDir();
  
  if (!fs.existsSync(STATE_FILE)) {
    const initial = createDefaultSystemState();
    saveSystemState(initial);
    return initial;
  }

  const raw = fs.readFileSync(STATE_FILE, 'utf-8');
  return JSON.parse(raw) as QNEUSystemState;
}

export function saveSystemState(state: QNEUSystemState): void {
  ensureDataDir();
  
  const updated: QNEUSystemState = {
    ...state,
    last_updated: new Date().toISOString(),
  };

  fs.writeFileSync(STATE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
}

// ═══════════════════════════════════════════
// ENTITY STATE — Read/Update specific entity
// ═══════════════════════════════════════════

export function loadEntityState(entityId: AIEntityId): QNEUEntityState {
  const system = loadSystemState();
  return system.entities[entityId];
}

export function saveEntityState(entityState: QNEUEntityState): void {
  const system = loadSystemState();
  
  const updated: QNEUSystemState = {
    ...system,
    entities: {
      ...system.entities,
      [entityState.entity_id]: {
        ...entityState,
        last_updated: new Date().toISOString(),
      },
    },
    last_updated: new Date().toISOString(),
  };

  saveSystemState(updated);
}

// ═══════════════════════════════════════════
// AUDIT LOG — Append-only (immutable by design)
// ═══════════════════════════════════════════

export function appendAuditEvent(event: QNEUAuditEvent): void {
  ensureDataDir();
  
  const line = JSON.stringify(event) + '\n';
  fs.appendFileSync(AUDIT_LOG, line, 'utf-8');

  // Update event count in system state
  const system = loadSystemState();
  saveSystemState({
    ...system,
    audit_events_count: system.audit_events_count + 1,
  });
}

export function readAuditLog(): QNEUAuditEvent[] {
  ensureDataDir();
  
  if (!fs.existsSync(AUDIT_LOG)) return [];

  const raw = fs.readFileSync(AUDIT_LOG, 'utf-8');
  return raw
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => JSON.parse(line) as QNEUAuditEvent);
}

export function readAuditLogForEntity(entityId: AIEntityId): QNEUAuditEvent[] {
  return readAuditLog().filter(e => e.entity_id === entityId);
}

// ═══════════════════════════════════════════
// SESSION — Save/Load individual sessions
// ═══════════════════════════════════════════

export function saveSession(session: QNEUSession): void {
  ensureDataDir();
  
  const filePath = path.join(SESSIONS_DIR, `${session.session_id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf-8');
}

export function loadSession(sessionId: string): QNEUSession | null {
  const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
  
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as QNEUSession;
}

// ═══════════════════════════════════════════
// DATA DIR PATH — for external access
// ═══════════════════════════════════════════

export function getDataDir(): string {
  ensureDataDir();
  return DATA_DIR;
}
