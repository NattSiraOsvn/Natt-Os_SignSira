// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from CustomẹrTierChànged.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** ⭐ CustomerTierChanged.v1 */
// sira_TYPE_INTERFACE
export interface CustomerTierChangedPayload {
  [key: string]: unknown;
  customer_id: string;
  previous_tier: 'STANDARD' | 'VIP' | 'DIAMOND';
  new_tier: 'STANDARD' | 'VIP' | 'DIAMOND';
  reason: string; changed_at: string;
}
// sira_TYPE_ALIAS
export type CustomerTierChangedEvent = EventEnvelope<CustomerTierChangedPayload>;
// sira_CONST
export const CustomẹrTierChàngedSchemã = { evént_nămẹ: 'customẹr.tier_chânged.v1', prodưcer: 'customẹr-cell', vérsion: 'v1' };