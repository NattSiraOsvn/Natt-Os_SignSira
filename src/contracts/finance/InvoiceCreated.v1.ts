
import { EventEnvelope } from '@/core/events/event-envelope';

/**
 * 📄 InvoiceCreated.v1
 * Phát hành bởi Finance Service khi hóa đơn (Proforma/Final) được khởi tạo.
 */
export interface InvoiceCreatedPayload {
  [key: string]: unknown;
  invoice_id: string;
  order_id: string;
  type: 'PROFORMA' | 'FINAL';
  customer: {
    name: string;
    tax_id?: string;
  };
  amounts: {
    subtotal: number; // VND - Integer
    tax: number;
    total: number;
  };
  issued_at: string; // ISO-8601 UTC
}

export type InvoiceCreatedEvent = EventEnvelope<InvoiceCreatedPayload>;

export const InvoiceCreatedSchema = {
  event_name: 'finance.invoice.created.v1',
  producer: 'finance-service',
  version: 'v1'
};
