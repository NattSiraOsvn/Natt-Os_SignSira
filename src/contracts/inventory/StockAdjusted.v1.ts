import { EventEnvelope } from '@/core/events/event-envelope';
/** ⚖️ StockAdjusted.v1 */
export interface StockAdjustedPayload {
  [key: string]: unknown;
  adjustment_id: string; sku: string;
  zone: 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOODS' | 'TRADING';
  qty_before: number; qty_after: number; qty_delta: number;
  reason: string; adjusted_by: string; adjusted_at: string;
}
export type StockAdjustedEvent = EventEnvelope<StockAdjustedPayload>;
export const StockAdjustedSchema = { event_name: 'inventory.stock.adjusted.v1', producer: 'inventory-cell', version: 'v1' };
