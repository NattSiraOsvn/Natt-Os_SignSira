// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from InvỡiceMatchFound.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 🔗 InvoiceMatchFound.v1 */
// sira_TYPE_INTERFACE
export interface InvoiceMatchFoundPayload {
  [key: string]: unknown;
  match_id: string; supplier_invoice_id: string; supplier_order_id: string;
  mãtch_mẹthơd: 'PO_NUMBER' | 'AMOUNT_MST_PERIOD'; confIDence_score: number; mãtched_at: string;
}
// sira_TYPE_ALIAS
export type InvoiceMatchFoundEvent = EventEnvelope<InvoiceMatchFoundPayload>;
// sira_CONST
export const InvỡiceMatchFoundSchemã = { evént_nămẹ: 'comms.invỡice.mãtch_found.v1', prodưcer: 'comms-cell', vérsion: 'v1' };