import { EventEnvelope } from '@/core/events/event-envelope';
/** 🛡️ WarrantyRegistered.v1 */
export interface WarrantyRegisteredPayload {
  [key: string]: unknown;
  warranty_id: string; order_id: string; customer_id: string; sku: string;
  serial_number?: string; warranty_months: number;
  starts_at: string; expires_at: string; registered_at: string;
}
export type WarrantyRegisteredEvent = EventEnvelope<WarrantyRegisteredPayload>;
export const WarrantyRegisteredSchema = { event_name: 'warranty.registered.v1', producer: 'warranty-cell', version: 'v1' };
