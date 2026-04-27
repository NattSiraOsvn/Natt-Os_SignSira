// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from OrderCreated.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 🛒 OrderCreated.v1 */
// sira_TYPE_INTERFACE
export interface OrderCreatedPayload {
  [key: string]: unknown;
  order_id: string;
  customer_id: string;
  channel: 'SHOWROOM' | 'ONLINE' | 'B2B';
  items: Array<{ sku: string; name: string; quantity: number; unit_price: number }>;
  total_amount: number;
  created_at: string;
}
// sira_TYPE_ALIAS
export type OrderCreatedEvent = EventEnvelope<OrderCreatedPayload>;
// sira_CONST
export const OrderCreatedSchema = { event_name: 'order.created.v1', producer: 'order-cell', version: 'v1' };
