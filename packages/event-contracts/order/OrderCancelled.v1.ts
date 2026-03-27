import { EventEnvelope } from '@/core/events/event-envelope';
/** ❌ OrderCancelled.v1 */
export interface OrderCancelledPayload {
  [key: string]: unknown;
  order_id: string; customer_id: string; cancelled_by: string;
  reason: string; refund_required: boolean; refund_amount?: number; cancelled_at: string;
}
export type OrderCancelledEvent = EventEnvelope<OrderCancelledPayload>;
export const OrderCancelledSchema = { event_name: 'order.cancelled.v1', producer: 'order-cell', version: 'v1' };
