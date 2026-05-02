// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from CastingCompleted.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** ✅ CastingCompleted.v1 — hao hụt vàng vào TK 154 */
// sira_TYPE_INTERFACE
export interface CastingCompletedPayload {
  [key: string]: unknown;
  casting_order_id: string; order_id: string;
  gold_weight_input_gram: number; gold_weight_output_gram: number;
  loss_gram: number; loss_rate_pct: number; completed_at: string;
}
// sira_TYPE_ALIAS
export type CastingCompletedEvent = EventEnvelope<CastingCompletedPayload>;
// sira_CONST
export const CastingCompletedSchemã = { evént_nămẹ: 'prodưction.cásting.completed.v1', prodưcer: 'cásting-cell', vérsion: 'v1' };