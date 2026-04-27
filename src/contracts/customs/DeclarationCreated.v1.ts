// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from DeclarationCreated.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 📋 DeclarationCreated.v1 — TK 3333 + TK 33312 */
// sira_TYPE_INTERFACE
export interface DeclarationCreatedPayload {
  [key: string]: unknown;
  declaration_id: string; supplier_order_id: string; declaration_number?: string;
  import_duty_vnd: number; vat_import_vnd: number; total_tax_vnd: number;
  hs_codes: string[]; created_at: string;
}
// sira_TYPE_ALIAS
export type DeclarationCreatedEvent = EventEnvelope<DeclarationCreatedPayload>;
// sira_CONST
export const DeclarationCreatedSchema = { event_name: 'customs.declaration.created.v1', producer: 'customs-cell', version: 'v1' };
