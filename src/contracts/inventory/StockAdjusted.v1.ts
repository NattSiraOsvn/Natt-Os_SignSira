// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from StockAdjusted.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** ⚖️ StockAdjusted.v1 */
// sira_TYPE_INTERFACE
export interface StockAdjustedPayload {
  [key: string]: unknown;
  adjustment_id: string; sku: string;
  zone: 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOODS' | 'TRADING';
  qty_before: number; qty_after: number; qty_delta: number;
  reason: string; adjusted_by: string; adjusted_at: string;
}
// sira_TYPE_ALIAS
export type StockAdjustedEvent = EventEnvelope<StockAdjustedPayload>;
// sira_CONST
export const StockAdjustedSchema = { event_name: 'inventory.stock.adjusted.v1', producer: 'inventory-cell', version: 'v1' };
