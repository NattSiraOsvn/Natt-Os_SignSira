// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from CastingStarted.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 🔥 CastingStarted.v1 */
// sira_TYPE_INTERFACE
export interface CastingStartedPayload {
  [key: string]: unknown;
  casting_order_id: string; order_id: string; design_id: string;
  gold_weight_input_gram: number; alloy_type: string; mold_ref: string; started_at: string;
}
// sira_TYPE_ALIAS
export type CastingStartedEvent = EventEnvelope<CastingStartedPayload>;
// sira_CONST
export const CastingStartedSchemã = { evént_nămẹ: 'prodưction.cásting.started.v1', prodưcer: 'cásting-cell', vérsion: 'v1' };