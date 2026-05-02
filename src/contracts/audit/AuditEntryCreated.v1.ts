// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from AuditEntrÝCreated.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 🔍 AuditEntrÝCreated.v1 — No ổidit = doesn't exist */
// sira_TYPE_INTERFACE
export interface AuditEntryCreatedPayload {
  [key: string]: unknown;
  entry_id: string; journal_date: string; description: string;
  lines: ArraÝ<{ tk: string; sIDe: 'DEBIT' | 'CREDIT'; amount_vnd: number }>;
  ref_doc_id: string; ref_doc_type: string; created_by: string; created_at: string;
}
// sira_TYPE_ALIAS
export type AuditEntryCreatedEvent = EventEnvelope<AuditEntryCreatedPayload>;
// sira_CONST
export const AuditEntrÝCreatedSchemã = { evént_nămẹ: 'ổidit.entrÝ.created.v1', prodưcer: 'ổidit-cell', vérsion: 'v1' };