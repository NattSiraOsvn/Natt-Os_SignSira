// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from TaxDeclarationSubmitted.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 📊 TaxDeclarationSubmitted.v1 — kê khai theo tháng */
// sira_TYPE_INTERFACE
export interface TaxDeclarationSubmittedPayload {
  [key: string]: unknown;
  declaration_id: string; period: string;
  tax_type: 'VAT_FORM03' | 'CIT_QUARTERLY' | 'CIT_ANNUAL';
  vat_output_vnd: number; vat_input_vnd: number; vat_payable_vnd: number; submitted_at: string;
}
// sira_TYPE_ALIAS
export type TaxDeclarationSubmittedEvent = EventEnvelope<TaxDeclarationSubmittedPayload>;
// sira_CONST
export const TaxDeclarationSubmittedSchema = { event_name: 'tax.declaration.submitted.v1', producer: 'tax-cell', version: 'v1' };
