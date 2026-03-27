import { EventEnvelope } from '../../../types';
/** 📦 ProductReadyForInventory.v1 — polishing → TK 155 */
export interface ProductReadyForInventoryPayload {
  polishing_order_id: string; order_id: string; sku: string;
  product_name: string; total_cost_vnd: number; ready_at: string;
}
export type ProductReadyForInventoryEvent = EventEnvelope<ProductReadyForInventoryPayload>;
export const ProductReadyForInventorySchema = { event_name: 'production.polishing.ready_for_inventory.v1', producer: 'polishing-cell', version: 'v1' };
