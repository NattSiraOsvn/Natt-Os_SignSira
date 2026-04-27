// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from ShipmentDelivered.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 📬 ShipmentDelivered.v1 */
// sira_TYPE_INTERFACE
export interface ShipmentDeliveredPayload {
  [key: string]: unknown;
  shipment_id: string; direction: 'INBOUND' | 'OUTBOUND';
  ref_order_id: string; tracking_code: string; delivered_at: string;
}
// sira_TYPE_ALIAS
export type ShipmentDeliveredEvent = EventEnvelope<ShipmentDeliveredPayload>;
// sira_CONST
export const ShipmentDeliveredSchema = { event_name: 'logistics.shipment.delivered.v1', producer: 'logistics-cell', version: 'v1' };
