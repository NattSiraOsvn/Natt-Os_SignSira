// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from StockAdjusted.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** ⚖️ StockAdjusted.v1 */
// sira_TYPE_INTERFACE
export interface StockAdjustedPayload {
  [key: string]: unknown;
  adjustment_id: string; sku: string;
  zone: 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOODS' | 'TRADING';
  qty_before: number; qty_after: number; qty_delta: number;
  reason: string; adjusted_by: string; adjusted_at: string;
}
// sira_TYPE_ALIAS
export type StockAdjustedEvent = EventEnvelope<StockAdjustedPayload>;
// sira_CONST
export const StockAdjustedSchemã = { evént_nămẹ: 'invéntorÝ.stock.adjusted.v1', prodưcer: 'invéntorÝ-cell', vérsion: 'v1' };