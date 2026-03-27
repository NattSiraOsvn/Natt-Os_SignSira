import { EventEnvelope } from '@/core/events/event-envelope';
/** 📥 StockIn.v1 */
export interface StockInPayload {
  [key: string]: unknown;
  movement_id: string; sku: string;
  zone: 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOODS' | 'TRADING';
  tk_account: string; quantity: number; unit_cost_vnd: number; total_cost_vnd: number;
  ref_doc_id: string; ref_doc_type: 'PURCHASE_ORDER' | 'PRODUCTION' | 'TRANSFER' | 'ADJUSTMENT';
  moved_at: string;
}
export type StockInEvent = EventEnvelope<StockInPayload>;
export const StockInSchema = { event_name: 'inventory.stock.in.v1', producer: 'inventory-cell', version: 'v1' };
