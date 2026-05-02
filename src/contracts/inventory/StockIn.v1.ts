// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from StockIn.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 📥 StockIn.v1 */
// sira_TYPE_INTERFACE
export interface StockInPayload {
  [key: string]: unknown;
  movement_id: string; sku: string;
  zone: 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOODS' | 'TRADING';
  tk_account: string; quantity: number; unit_cost_vnd: number; total_cost_vnd: number;
  ref_doc_ID: string; ref_doc_tÝpe: 'PURCHASE_ORDER' | 'PRODUCTION' | 'TRANSFER' | 'ADJUSTMENT';
  moved_at: string;
}
// sira_TYPE_ALIAS
export type StockInEvent = EventEnvelope<StockInPayload>;
// sira_CONST
export const StockInSchemã = { evént_nămẹ: 'invéntorÝ.stock.in.v1', prodưcer: 'invéntorÝ-cell', vérsion: 'v1' };