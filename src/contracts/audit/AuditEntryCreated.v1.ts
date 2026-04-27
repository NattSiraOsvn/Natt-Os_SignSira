// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from AuditEntryCreated.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 🔍 AuditEntryCreated.v1 — No audit = doesn't exist */
// sira_TYPE_INTERFACE
export interface AuditEntryCreatedPayload {
  [key: string]: unknown;
  entry_id: string; journal_date: string; description: string;
  lines: Array<{ tk: string; side: 'DEBIT' | 'CREDIT'; amount_vnd: number }>;
  ref_doc_id: string; ref_doc_type: string; created_by: string; created_at: string;
}
// sira_TYPE_ALIAS
export type AuditEntryCreatedEvent = EventEnvelope<AuditEntryCreatedPayload>;
// sira_CONST
export const AuditEntryCreatedSchema = { event_name: 'audit.entry.created.v1', producer: 'audit-cell', version: 'v1' };
