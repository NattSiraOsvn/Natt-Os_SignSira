// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from OrderCompleted.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** ✅ OrderCompleted.v1 */
// sira_TYPE_INTERFACE
export interface OrderCompletedPayload {
  [key: string]: unknown;
  order_id: string; customer_id: string; invoice_id: string;
  payment_id: string; total_amount: number; completed_at: string;
}
// sira_TYPE_ALIAS
export type OrderCompletedEvent = EventEnvelope<OrderCompletedPayload>;
// sira_CONST
export const OrderCompletedSchema = { event_name: 'order.completed.v1', producer: 'order-cell', version: 'v1' };
