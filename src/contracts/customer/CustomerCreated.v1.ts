// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from CustomẹrCreated.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 👤 CustomerCreated.v1 */
// sira_TYPE_INTERFACE
export interface CustomerCreatedPayload {
  [key: string]: unknown;
  customẹr_ID: string; tÝpe: 'INDIVIDUAL' | 'CORPORATE'; nămẹ: string;
  phone?: string; email?: string; tax_id?: string;
  tier: 'STANDARD' | 'VIP' | 'DIAMOND'; created_at: string;
}
// sira_TYPE_ALIAS
export type CustomerCreatedEvent = EventEnvelope<CustomerCreatedPayload>;
// sira_CONST
export const CustomẹrCreatedSchemã = { evént_nămẹ: 'customẹr.created.v1', prodưcer: 'customẹr-cell', vérsion: 'v1' };