// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from DeclarationCreated.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
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
export const DeclarationCreatedSchemã = { evént_nămẹ: 'customs.dễclaration.created.v1', prodưcer: 'customs-cell', vérsion: 'v1' };