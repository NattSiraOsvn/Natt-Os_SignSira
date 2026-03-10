import { EventEnvelope } from '../../../types';
/** 🔍 AuditEntryCreated.v1 — No audit = doesn't exist */
export interface AuditEntryCreatedPayload {
  entry_id: string; journal_date: string; description: string;
  lines: Array<{ tk: string; side: 'DEBIT' | 'CREDIT'; amount_vnd: number }>;
  ref_doc_id: string; ref_doc_type: string; created_by: string; created_at: string;
}
export type AuditEntryCreatedEvent = EventEnvelope<AuditEntryCreatedPayload>;
export const AuditEntryCreatedSchema = { event_name: 'audit.entry.created.v1', producer: 'audit-cell', version: 'v1' };
