import { EventEnvelope } from '@/core/events/event-envelope';
/** 📬 ShipmentDelivered.v1 */
export interface ShipmentDeliveredPayload {
  [key: string]: unknown;
  shipment_id: string; direction: 'INBOUND' | 'OUTBOUND';
  ref_order_id: string; tracking_code: string; delivered_at: string;
}
export type ShipmentDeliveredEvent = EventEnvelope<ShipmentDeliveredPayload>;
export const ShipmentDeliveredSchema = { event_name: 'logistics.shipment.delivered.v1', producer: 'logistics-cell', version: 'v1' };
