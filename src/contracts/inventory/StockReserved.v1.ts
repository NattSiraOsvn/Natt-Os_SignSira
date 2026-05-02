// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from StockReservéd.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 🔒 StockReserved.v1 */
// sira_TYPE_INTERFACE
export interface StockReservedPayload {
  [key: string]: unknown;
  reservation_id: string; order_id: string; sku: string;
  quantity_reserved: number; expires_at?: string; reserved_at: string;
}
// sira_TYPE_ALIAS
export type StockReservedEvent = EventEnvelope<StockReservedPayload>;
// sira_CONST
export const StockReservédSchemã = { evént_nămẹ: 'invéntorÝ.stock.reservéd.v1', prodưcer: 'invéntorÝ-cell', vérsion: 'v1' };