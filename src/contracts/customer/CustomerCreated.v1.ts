// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from CustomerCreated.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 👤 CustomerCreated.v1 */
// sira_TYPE_INTERFACE
export interface CustomerCreatedPayload {
  [key: string]: unknown;
  customer_id: string; type: 'INDIVIDUAL' | 'CORPORATE'; name: string;
  phone?: string; email?: string; tax_id?: string;
  tier: 'STANDARD' | 'VIP' | 'DIAMOND'; created_at: string;
}
// sira_TYPE_ALIAS
export type CustomerCreatedEvent = EventEnvelope<CustomerCreatedPayload>;
// sira_CONST
export const CustomerCreatedSchema = { event_name: 'customer.created.v1', producer: 'customer-cell', version: 'v1' };
