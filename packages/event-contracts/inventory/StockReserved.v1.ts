import { EventEnvelope } from '../../../types';
/** 🔒 StockReserved.v1 */
export interface StockReservedPayload {
  reservation_id: string; order_id: string; sku: string;
  quantity_reserved: number; expires_at?: string; reserved_at: string;
}
export type StockReservedEvent = EventEnvelope<StockReservedPayload>;
export const StockReservedSchema = { event_name: 'inventory.stock.reserved.v1', producer: 'inventory-cell', version: 'v1' };
