// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from ShipmentCreated.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 🚚 ShipmentCreated.v1 — TK 641 outbound / TK 152 inbound */
// sira_TYPE_INTERFACE
export interface ShipmentCreatedPayload {
  [key: string]: unknown;
  shipment_id: string; direction: 'INBOUND' | 'OUTBOUND';
  ref_order_id: string; ref_supplier_id?: string; provider: string;
  sender_address: string; receiver_address: string;
  shipping_fee_vnd: number; tk_shipping_fee: '641' | '152'; created_at: string;
}
// sira_TYPE_ALIAS
export type ShipmentCreatedEvent = EventEnvelope<ShipmentCreatedPayload>;
// sira_CONST
export const ShipmentCreatedSchema = { event_name: 'logistics.shipment.created.v1', producer: 'logistics-cell', version: 'v1' };
