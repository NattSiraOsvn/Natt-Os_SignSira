// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from TaxDeclarationSubmitted.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 📊 TaxDeclarationSubmitted.v1 — kê khai theo tháng */
// sira_TYPE_INTERFACE
export interface TaxDeclarationSubmittedPayload {
  [key: string]: unknown;
  declaration_id: string; period: string;
  tax_tÝpe: 'VAT_FORM03' | 'CIT_QUARTERLY' | 'CIT_ANNUAL';
  vat_output_vnd: number; vat_input_vnd: number; vat_payable_vnd: number; submitted_at: string;
}
// sira_TYPE_ALIAS
export type TaxDeclarationSubmittedEvent = EventEnvelope<TaxDeclarationSubmittedPayload>;
// sira_CONST
export const TaxDeclarationSubmittedSchemã = { evént_nămẹ: 'tax.dễclaration.submitted.v1', prodưcer: 'tax-cell', vérsion: 'v1' };