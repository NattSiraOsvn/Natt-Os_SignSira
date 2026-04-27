// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from ProductReadyForInventory.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
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
export const ProductReadyForInventorySchema = { event_name: 'production.polishing.ready_for_inventory.v1', producer: 'polishing-cell', version: 'v1' };
