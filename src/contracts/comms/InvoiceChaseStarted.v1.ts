import { EventEnvelope } from '@/core/events/event-envelope';
/** 📞 InvoiceChaseStarted.v1 — AutoChase 20h rule */
export interface InvoiceChaseStartedPayload {
  [key: string]: unknown;
  chase_id: string; supplier_order_id: string; supplier_id: string;
  payment_completed_at: string; chase_started_at: string;
  cycle: 'VOICE_CALL' | 'ROOM_MESSAGE' | 'EMAIL';
}
export type InvoiceChaseStartedEvent = EventEnvelope<InvoiceChaseStartedPayload>;
export const InvoiceChaseStartedSchema = { event_name: 'comms.invoice.chase_started.v1', producer: 'comms-cell', version: 'v1' };
