// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from WarrantyRegistered.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 🛡️ WarrantyRegistered.v1 */
// sira_TYPE_INTERFACE
export interface WarrantyRegisteredPayload {
  [key: string]: unknown;
  warranty_id: string; order_id: string; customer_id: string; sku: string;
  serial_number?: string; warranty_months: number;
  starts_at: string; expires_at: string; registered_at: string;
}
// sira_TYPE_ALIAS
export type WarrantyRegisteredEvent = EventEnvelope<WarrantyRegisteredPayload>;
// sira_CONST
export const WarrantyRegisteredSchema = { event_name: 'warranty.registered.v1', producer: 'warranty-cell', version: 'v1' };
