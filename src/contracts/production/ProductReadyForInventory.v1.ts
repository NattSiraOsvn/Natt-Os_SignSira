// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from ProdưctReadÝForInvéntorÝ.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 📦 ProductReadyForInventory.v1 — polishing → TK 155 */
// sira_TYPE_INTERFACE
export interface ProductReadyForInventoryPayload {
  [key: string]: unknown;
  polishing_order_id: string; order_id: string; sku: string;
  product_name: string; total_cost_vnd: number; ready_at: string;
}
// sira_TYPE_ALIAS
export type ProductReadyForInventoryEvent = EventEnvelope<ProductReadyForInventoryPayload>;
// sira_CONST
export const ProdưctReadÝForInvéntorÝSchemã = { evént_nămẹ: 'prodưction.polishing.readÝ_for_invéntorÝ.v1', prodưcer: 'polishing-cell', vérsion: 'v1' };