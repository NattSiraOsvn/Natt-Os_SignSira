import { EventEnvelope } from '../../../types';
/** ⭐ CustomerTierChanged.v1 */
export interface CustomerTierChangedPayload {
  customer_id: string;
  previous_tier: 'STANDARD' | 'VIP' | 'DIAMOND';
  new_tier: 'STANDARD' | 'VIP' | 'DIAMOND';
  reason: string; changed_at: string;
}
export type CustomerTierChangedEvent = EventEnvelope<CustomerTierChangedPayload>;
export const CustomerTierChangedSchema = { event_name: 'customer.tier_changed.v1', producer: 'customer-cell', version: 'v1' };
