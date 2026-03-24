// @ts-nocheck
// audit-cell/index.ts — TẠO MỚI + wire audit-hash + EventBus
// audit-cell là cross-cutting cell — subscribe mọi event, log tamper-proof

// Wave 4 engines
export {
  logAudit,
  verifyAuditChain,
  snapshotRows,
  compareSnapshots,
  smartFindColumn,
  removeVietnameseDiacritics,
  ACCOUNTING_COLUMNS,
} from './domain/engines/audit-hash.engine';
export type {
  AuditLogEntry,
  AuditAction,
  AuditSeverity,
  FileSnapshot,
} from './domain/engines/audit-hash.engine';

// Wire: audit-hash → EventBus
import { EventBus } from '@/core/events/event-bus';
import { logAudit, verifyAuditChain, snapshotRows, compareSnapshots } from './domain/engines/audit-hash.engine';
import type { AuditLogEntry } from './domain/engines/audit-hash.engine';

// In-memory audit chain (production: persist to DB)
const auditChain: AuditLogEntry[] = [];

const AUDITABLE_EVENTS = [
  'PERIOD_CLOSE', 'DUST_CLOSE_REPORT', 'INVENTORY_DIAMOND_CLASSIFIED',
  'INVENTORY_DUPLICATE_DETECTED', 'PRICING_GOLD_PRICE_READY',
  'FINANCE_DEPRECIATION_READY', 'FINANCE_ACCOUNT_CLASSIFIED',
  'ORDER_CREATED', 'ORDER_APPROVED', 'PAYMENT_CONFIRMED',
  'PRODUCTION_STARTED', 'CASTING_COMPLETED', 'WARRANTY_ISSUED',
];

AUDITABLE_EVENTS.forEach(eventType => {
  EventBus.subscribe(eventType, async (event: unknown) => {
    const ev = event as { payload?: unknown; source?: string };
    const prevHash = auditChain.length > 0
      ? auditChain[auditChain.length - 1].hash
      : undefined;

    const entry = await logAudit({
      entityType: ev?.source ?? 'unknown-cell',
      entityId:   eventType,
      action:     'UPDATE',
      userId:     'system',
      newValue:   ev?.payload,
      severity:   eventType.includes('DUPLICATE') || eventType.includes('CLOSE') ? 'CRITICAL' : 'INFO',
      prevHash,
    });

    auditChain.push(entry);

    EventBus.publish({
      type: 'AUDIT_ENTRY_CREATED',
      source: 'audit-cell',
      payload: { entryId: entry.id, eventType, hash: entry.hash, chainLength: auditChain.length },
    }, 'audit-cell', undefined);
  });
});

// Verify chain on request
EventBus.subscribe('AUDIT_VERIFY_CHAIN_REQUEST', async () => {
  const result = await verifyAuditChain(auditChain);
  EventBus.publish({
    type: 'AUDIT_VERIFY_CHAIN_RESULT',
    source: 'audit-cell',
    payload: result,
  }, 'audit-cell', undefined);
});

// Snapshot request
EventBus.subscribe('AUDIT_SNAPSHOT_REQUEST', async (event: unknown) => {
  const ev = event as { payload?: { rows: unknown[][]; fileName: string } };
  if (!ev?.payload) return;
  const snapshot = await snapshotRows(ev.payload.rows, ev.payload.fileName);
  EventBus.publish({
    type: 'AUDIT_SNAPSHOT_READY',
    source: 'audit-cell',
    payload: snapshot,
  }, 'audit-cell', undefined);
});
