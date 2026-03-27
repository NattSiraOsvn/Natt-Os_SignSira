import { EventEnvelope } from '@/core/events/event-envelope';
/** ✅ OrderCompleted.v1 */
export interface OrderCompletedPayload {
  [key: string]: unknown;
  order_id: string; customer_id: string; invoice_id: string;
  payment_id: string; total_amount: number; completed_at: string;
}
export type OrderCompletedEvent = EventEnvelope<OrderCompletedPayload>;
export const OrderCompletedSchema = { event_name: 'order.completed.v1', producer: 'order-cell', version: 'v1' };
