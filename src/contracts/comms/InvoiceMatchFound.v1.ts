import { EventEnvelope } from '@/core/events/event-envelope';
/** 🔗 InvoiceMatchFound.v1 */
export interface InvoiceMatchFoundPayload {
  [key: string]: unknown;
  match_id: string; supplier_invoice_id: string; supplier_order_id: string;
  match_method: 'PO_NUMBER' | 'AMOUNT_MST_PERIOD'; confidence_score: number; matched_at: string;
}
export type InvoiceMatchFoundEvent = EventEnvelope<InvoiceMatchFoundPayload>;
export const InvoiceMatchFoundSchema = { event_name: 'comms.invoice.match_found.v1', producer: 'comms-cell', version: 'v1' };
