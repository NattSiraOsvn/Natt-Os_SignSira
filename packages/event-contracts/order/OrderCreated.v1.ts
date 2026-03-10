import { EventEnvelope } from '../../../types';
/** 🛒 OrderCreated.v1 */
export interface OrderCreatedPayload {
  order_id: string;
  customer_id: string;
  channel: 'SHOWROOM' | 'ONLINE' | 'B2B';
  items: Array<{ sku: string; name: string; quantity: number; unit_price: number }>;
  total_amount: number;
  created_at: string;
}
export type OrderCreatedEvent = EventEnvelope<OrderCreatedPayload>;
export const OrderCreatedSchema = { event_name: 'order.created.v1', producer: 'order-cell', version: 'v1' };
