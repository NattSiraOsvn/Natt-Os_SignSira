// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from InvoiceMatchFound.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 🔗 InvoiceMatchFound.v1 */
// sira_TYPE_INTERFACE
export interface InvoiceMatchFoundPayload {
  [key: string]: unknown;
  match_id: string; supplier_invoice_id: string; supplier_order_id: string;
  match_method: 'PO_NUMBER' | 'AMOUNT_MST_PERIOD'; confidence_score: number; matched_at: string;
}
// sira_TYPE_ALIAS
export type InvoiceMatchFoundEvent = EventEnvelope<InvoiceMatchFoundPayload>;
// sira_CONST
export const InvoiceMatchFoundSchema = { event_name: 'comms.invoice.match_found.v1', producer: 'comms-cell', version: 'v1' };
