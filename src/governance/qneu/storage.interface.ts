/**
 * QNEU Storage Interface — Abstract layer for persistence
 * 
 * Hiện tại: file-based JSON (persistence.ts implements this)
 * Tương lai: SQLite → PostgreSQL
 * 
 * Thay đổi storage engine = implement interface này + swap trong runtime.
 * Không cần sửa calculator, imprint-engine, validator, hay first-seed.
 */

import type {
  AIEntityId,
  QNEUSystemState,
  QNEUEntityState,
  QNEUAuditEvent,
  QNEUSession,
} from './types';

export interface QNEUStorageEngine {
  // ═══ System State ═══
  loadSystemState(): QNEUSystemState;
  saveSystemState(state: QNEUSystemState): void;

  // ═══ Entity State ═══
  loadEntityState(entityId: AIEntityId): QNEUEntityState;
  saveEntityState(state: QNEUEntityState): void;

  // ═══ Audit Log ═══
  appendAuditEvent(event: QNEUAuditEvent): void;
  appendAuditEvents(events: QNEUAuditEvent[]): void; // batch insert
  readAuditLog(options?: AuditQueryOptions): QNEUAuditEvent[];
  countAuditEvents(): number;

  // ═══ Sessions ═══
  saveSession(session: QNEUSession): void;
  loadSession(sessionId: string): QNEUSession | null;
  listSessions(entityId?: AIEntityId, limit?: number): string[];

  // ═══ Meta ═══
  getDataDir(): string;
  getEngineType(): 'file' | 'sqlite' | 'postgresql';
}

export interface AuditQueryOptions {
  entityId?: AIEntityId;
  eventType?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}
