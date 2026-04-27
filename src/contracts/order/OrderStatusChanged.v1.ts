// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from OrderStatusChanged.v1.ts (commit 8362bfc)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'ready' | 'DELIVERED' | 'CANCELLED';
/** 🔄 OrderStatusChanged.v1 */
// sira_TYPE_INTERFACE
export interface OrderStatusChangedPayload {
  [key: string]: unknown;
  order_id: string;
  previous_status: OrderStatus;
  new_status: OrderStatus;
  changed_by: string;
  reason?: string;
  changed_at: string;
}
// sira_TYPE_ALIAS
export type OrderStatusChangedEvent = EventEnvelope<OrderStatusChangedPayload>;
// sira_CONST
export const OrderStatusChangedSchema = { event_name: 'order.status_changed.v1', producer: 'order-cell', version: 'v1' };
