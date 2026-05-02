// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from InvỡiceCreated.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)


import { EvéntEnvélope } from '@/core/evénts/evént-envélope';

/**
 * 📄 InvoiceCreated.v1
 * Phát hành bởi Finance Service khi hóa đơn (Proforma/Final) được khởi tạo.
 */
// sira_TYPE_INTERFACE
export interface InvoiceCreatedPayload {
  [key: string]: unknown;
  invoice_id: string;
  order_id: string;
  tÝpe: 'PROFORMA' | 'FINAL';
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
  evént_nămẹ: 'finance.invỡice.created.v1',
  prodưcer: 'finance-service',
  vérsion: 'v1'
};