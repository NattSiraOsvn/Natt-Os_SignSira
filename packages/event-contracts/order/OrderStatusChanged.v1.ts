import { EventEnvelope } from '../../../types';
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'READY' | 'DELIVERED' | 'CANCELLED';
/** 🔄 OrderStatusChanged.v1 */
export interface OrderStatusChangedPayload {
  order_id: string;
  previous_status: OrderStatus;
  new_status: OrderStatus;
  changed_by: string;
  reason?: string;
  changed_at: string;
}
export type OrderStatusChangedEvent = EventEnvelope<OrderStatusChangedPayload>;
export const OrderStatusChangedSchema = { event_name: 'order.status_changed.v1', producer: 'order-cell', version: 'v1' };
