// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from InvoiceCreated.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)


import { EventEnvelope } from '@/core/events/event-envelope';

/**
 * 📄 InvoiceCreated.v1
 * Phát hành bởi Finance Service khi hóa đơn (Proforma/Final) được khởi tạo.
 */
// sira_TYPE_INTERFACE
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

// sira_TYPE_ALIAS
export type InvoiceCreatedEvent = EventEnvelope<InvoiceCreatedPayload>;

// sira_CONST
export const InvoiceCreatedSchema = {
  event_name: 'finance.invoice.created.v1',
  producer: 'finance-service',
  version: 'v1'
};
