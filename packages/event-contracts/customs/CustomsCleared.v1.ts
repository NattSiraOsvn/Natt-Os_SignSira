import { EventEnvelope } from '@/core/events/event-envelope';
/** ✅ CustomsCleared.v1 */
export interface CustomsClearedPayload {
  [key: string]: unknown;
  declaration_id: string; supplier_order_id: string; clearance_ref: string;
  import_duty_paid_vnd: number; vat_import_paid_vnd: number; cleared_at: string;
}
export type CustomsClearedEvent = EventEnvelope<CustomsClearedPayload>;
export const CustomsClearedSchema = { event_name: 'customs.cleared.v1', producer: 'customs-cell', version: 'v1' };
