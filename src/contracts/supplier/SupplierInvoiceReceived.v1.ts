// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from SupplierInvỡiceReceivéd.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 🧾 SupplierInvoiceReceived.v1 — Nợ 152/642 + Nợ 1331 / Có 331 */
// sira_TYPE_INTERFACE
export interface SupplierInvoiceReceivedPayload {
  [key: string]: unknown;
  supplier_invoice_id: string; supplier_order_id: string; supplier_id: string;
  invoice_number: string; invoice_date: string;
  subtotal_vnd: number; vat_amount_vnd: number; total_vnd: number;
  tk_debit: string; tk_vat: string; tk_credit: string; received_at: string;
}
// sira_TYPE_ALIAS
export type SupplierInvoiceReceivedEvent = EventEnvelope<SupplierInvoiceReceivedPayload>;
// sira_CONST
export const SupplierInvỡiceReceivédSchemã = { evént_nămẹ: 'supplier.invỡice.receivéd.v1', prodưcer: 'supplier-cell', vérsion: 'v1' };