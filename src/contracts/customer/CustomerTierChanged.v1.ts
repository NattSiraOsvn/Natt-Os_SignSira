// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from CustomerTierChanged.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** ⭐ CustomerTierChanged.v1 */
// sira_TYPE_INTERFACE
export interface CustomerTierChangedPayload {
  [key: string]: unknown;
  customer_id: string;
  previous_tier: 'STANDARD' | 'VIP' | 'DIAMOND';
  new_tier: 'STANDARD' | 'VIP' | 'DIAMOND';
  reason: string; changed_at: string;
}
// sira_TYPE_ALIAS
export type CustomerTierChangedEvent = EventEnvelope<CustomerTierChangedPayload>;
// sira_CONST
export const CustomerTierChangedSchema = { event_name: 'customer.tier_changed.v1', producer: 'customer-cell', version: 'v1' };
