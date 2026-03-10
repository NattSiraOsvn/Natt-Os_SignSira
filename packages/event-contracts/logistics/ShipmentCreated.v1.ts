import { EventEnvelope } from '../../../types';
/** 🚚 ShipmentCreated.v1 — TK 641 outbound / TK 152 inbound */
export interface ShipmentCreatedPayload {
  shipment_id: string; direction: 'INBOUND' | 'OUTBOUND';
  ref_order_id: string; ref_supplier_id?: string; provider: string;
  sender_address: string; receiver_address: string;
  shipping_fee_vnd: number; tk_shipping_fee: '641' | '152'; created_at: string;
}
export type ShipmentCreatedEvent = EventEnvelope<ShipmentCreatedPayload>;
export const ShipmentCreatedSchema = { event_name: 'logistics.shipment.created.v1', producer: 'logistics-cell', version: 'v1' };
