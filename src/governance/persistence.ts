/**
 * QNEU File Storage — Implements QNEUStorageEngine
 * 
 * File-based JSON persistence (seed stage).
 * Implements batch insert for performance.
 * Implements QNEUStorageEngine interface for easy swap.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type {
  AIEntityId,
  QNEUSystemState,
  QNEUEntityState,
  QNEUAuditEvent,
  QNEUSession,
} from './types.js';
import type { QNEUStorageEngine, AuditQueryOptions } from './storage.interface.js';
import { QNEU_CONSTANTS } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'system-state.json');
const AUDIT_LOG = path.join(DATA_DIR, 'audit-log.jsonl');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// ═══════════════════════════════════════════
// DEFAULT STATE
// ═══════════════════════════════════════════

function createDefaultSystemState(): QNEUSystemState {
  const entities: Record<string, QNEUEntityState> = {};
  const entityIds: AIEntityId[] = ['KIM', 'BANG', 'BOI_BOI', 'THIEN', 'CAN'];
  const now = new Date().toISOString();

  for (const id of entityIds) {
    entities[id] = {
      entity_id: id,
      current_score: 0,
      frequency_imprints: [],
      permanent_nodes: [],
      total_sessions: 0,
      total_impacts: 0,
      total_penalties: 0,
      last_updated: now,
    };
  }

  return {
    version: QNEU_CONSTANTS.VERSION,
    entities: entities as Record<AIEntityId, QNEUEntityState>,
    audit_events_count: 0,
    last_updated: now,
  };
}

// ═══════════════════════════════════════════
// FILE STORAGE ENGINE
// ═══════════════════════════════════════════

export class FileStorageEngine implements QNEUStorageEngine {

  // --- System State ---

  loadSystemState(): QNEUSystemState {
    ensureDataDir();
    if (!fs.existsSync(STATE_FILE)) {
      const initial = createDefaultSystemState();
      this.saveSystemState(initial);
      return initial;
    }
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }

  saveSystemState(state: QNEUSystemState): void {
    ensureDataDir();
    const updated = { ...state, last_updated: new Date().toISOString() };
    /* TWIN_PERSIST: intentional disk write — digital twin / audit infrastructure, not business logic */
    fs.writeFileSync(STATE_FILE, JSON.stringify(updated, null, 2), 'utf-8'); // TWIN_PERSIST // TWIN_PERSIST
  }

  // --- Entity State ---

  loadEntityState(entityId: AIEntityId): QNEUEntityState {
    return this.loadSystemState().entities[entityId];
  }

  saveEntityState(entityState: QNEUEntityState): void {
    const system = this.loadSystemState();
    const updated: QNEUSystemState = {
      ...system,
      entities: {
        ...system.entities,
        [entityState.entity_id]: { ...entityState, last_updated: new Date().toISOString() },
      },
      last_updated: new Date().toISOString(),
    };
    this.saveSystemState(updated);
  }

  // --- Audit Log ---

  appendAuditEvent(event: QNEUAuditEvent): void {
    ensureDataDir();
    fs.appendFileSync(AUDIT_LOG, JSON.stringify(event) + '\n', 'utf-8');
    const system = this.loadSystemState();
    this.saveSystemState({ ...system, audit_events_count: system.audit_events_count + 1 });
  }

  appendAuditEvents(events: QNEUAuditEvent[]): void {
    ensureDataDir();
    const lines = events.map(e => JSON.stringify(e)).join('\n') + '\n';
    fs.appendFileSync(AUDIT_LOG, lines, 'utf-8');
    const system = this.loadSystemState();
    this.saveSystemState({ ...system, audit_events_count: system.audit_events_count + events.length });
  }

  readAuditLog(options?: AuditQueryOptions): QNEUAuditEvent[] {
    ensureDataDir();
    if (!fs.existsSync(AUDIT_LOG)) return [];

    let events: QNEUAuditEvent[] = fs.readFileSync(AUDIT_LOG, 'utf-8')
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => JSON.parse(line) as QNEUAuditEvent);

    if (options?.entityId) events = events.filter(e => e.entity_id === options.entityId);
    if (options?.eventType) events = events.filter(e => e.event_type === options.eventType);
    if (options?.fromDate) events = events.filter(e => e.timestamp >= options.fromDate!);
    if (options?.toDate) events = events.filter(e => e.timestamp <= options.toDate!);
    if (options?.offset) events = events.slice(options.offset);
    if (options?.limit) events = events.slice(0, options.limit);

    return events;
  }

  countAuditEvents(): number {
    return this.loadSystemState().audit_events_count;
  }

  // --- Sessions ---

  saveSession(session: QNEUSession): void {
    ensureDataDir();
    /* TWIN_PERSIST: intentional disk write — digital twin / audit infrastructure, not business logic */
    fs.writeFileSync( // TWIN_PERSIST
      path.join(SESSIONS_DIR, `${session.session_id}.json`),
      JSON.stringify(session, null, 2),
      'utf-8',
    );
  }

  loadSession(sessionId: string): QNEUSession | null {
    const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  listSessions(entityId?: AIEntityId, limit?: number): string[] {
    ensureDataDir();
    if (!fs.existsSync(SESSIONS_DIR)) return [];
    let files = fs.readdirSync(SESSIONS_DIR).filter((f: string) => f.endsWith('.json'));

    if (entityId) {
      files = files.filter((f: string) => {
        try {
          const session = JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, f), 'utf-8'));
          return session.entity_id === entityId;
        } catch { return false; }
      });
    }

    if (limit) files = files.slice(-limit);
    return files.map((f: string) => f.replace('.json', ''));
  }

  // --- Meta ---

  getDataDir(): string {
    ensureDataDir();
    return DATA_DIR;
  }

  getEngineType(): 'file' | 'sqlite' | 'postgresql' {
    return 'file';
  }
}

// ═══════════════════════════════════════════
// SINGLETON + BACKWARD COMPAT EXPORTS
// ═══════════════════════════════════════════

let _engine: QNEUStorageEngine | null = null;

export function getStorageEngine(): QNEUStorageEngine {
  if (!_engine) _engine = new FileStorageEngine();
  return _engine;
}

export function setStorageEngine(engine: QNEUStorageEngine): void {
  _engine = engine;
}

// Backward compatible exports (used by runtime.ts, first-seed.ts)
export function loadSystemState(): QNEUSystemState { return getStorageEngine().loadSystemState(); }
export function saveSystemState(s: QNEUSystemState): void { getStorageEngine().saveSystemState(s); }
export function loadEntityState(id: AIEntityId): QNEUEntityState { return getStorageEngine().loadEntityState(id); }
export function saveEntityState(s: QNEUEntityState): void { getStorageEngine().saveEntityState(s); }
export function appendAuditEvent(e: QNEUAuditEvent): void { getStorageEngine().appendAuditEvent(e); }
export function readAuditLog(): QNEUAuditEvent[] { return getStorageEngine().readAuditLog(); }
export function saveSession(s: QNEUSession): void { getStorageEngine().saveSession(s); }
export function loadSession(id: string): QNEUSession | null { return getStorageEngine().loadSession(id); }
export function getDataDir(): string { return getStorageEngine().getDataDir(); }
