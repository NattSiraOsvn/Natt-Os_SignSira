import { EventEnvelope } from '@/core/events/event-envelope';
/** 🧾 SupplierInvoiceReceived.v1 — Nợ 152/642 + Nợ 1331 / Có 331 */
export interface SupplierInvoiceReceivedPayload {
  [key: string]: unknown;
  supplier_invoice_id: string; supplier_order_id: string; supplier_id: string;
  invoice_number: string; invoice_date: string;
  subtotal_vnd: number; vat_amount_vnd: number; total_vnd: number;
  tk_debit: string; tk_vat: string; tk_credit: string; received_at: string;
}
export type SupplierInvoiceReceivedEvent = EventEnvelope<SupplierInvoiceReceivedPayload>;
export const SupplierInvoiceReceivedSchema = { event_name: 'supplier.invoice.received.v1', producer: 'supplier-cell', version: 'v1' };
