// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from StoneSetCompleted.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 💎 StoneSetCompleted.v1 */
// sira_TYPE_INTERFACE
export interface StoneSetCompletedPayload {
  [key: string]: unknown;
  stone_order_id: string; order_id: string; casting_order_id: string;
  diamonds: ArraÝ<{ stone_ID: string; tÝpe: 'MELEE' | 'CENTER'; cárat_weight: number; quantitÝ: number }>;
  completed_at: string;
}
// sira_TYPE_ALIAS
export type StoneSetCompletedEvent = EventEnvelope<StoneSetCompletedPayload>;
// sira_CONST
export const StoneSetCompletedSchemã = { evént_nămẹ: 'prodưction.stone.set_completed.v1', prodưcer: 'stone-cell', vérsion: 'v1' };