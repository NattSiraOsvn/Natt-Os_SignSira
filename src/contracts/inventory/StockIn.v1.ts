// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from StockIn.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 📥 StockIn.v1 */
// sira_TYPE_INTERFACE
export interface StockInPayload {
  [key: string]: unknown;
  movement_id: string; sku: string;
  zone: 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOODS' | 'TRADING';
  tk_account: string; quantity: number; unit_cost_vnd: number; total_cost_vnd: number;
  ref_doc_id: string; ref_doc_type: 'PURCHASE_ORDER' | 'PRODUCTION' | 'TRANSFER' | 'ADJUSTMENT';
  moved_at: string;
}
// sira_TYPE_ALIAS
export type StockInEvent = EventEnvelope<StockInPayload>;
// sira_CONST
export const StockInSchema = { event_name: 'inventory.stock.in.v1', producer: 'inventory-cell', version: 'v1' };
