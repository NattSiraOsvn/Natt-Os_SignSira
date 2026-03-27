import { EventEnvelope } from '../../../types';
/** 📤 StockOut.v1 */
export interface StockOutPayload {
  movement_id: string; sku: string;
  zone: 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOODS' | 'TRADING';
  tk_account: string; quantity: number; unit_cost_vnd: number; total_cost_vnd: number;
  ref_doc_id: string; ref_doc_type: 'SALES_ORDER' | 'PRODUCTION' | 'TRANSFER' | 'ADJUSTMENT';
  moved_at: string;
}
export type StockOutEvent = EventEnvelope<StockOutPayload>;
export const StockOutSchema = { event_name: 'inventory.stock.out.v1', producer: 'inventory-cell', version: 'v1' };
