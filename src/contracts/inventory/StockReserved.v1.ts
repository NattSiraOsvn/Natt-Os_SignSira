// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from StockReserved.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 🔒 StockReserved.v1 */
// sira_TYPE_INTERFACE
export interface StockReservedPayload {
  [key: string]: unknown;
  reservation_id: string; order_id: string; sku: string;
  quantity_reserved: number; expires_at?: string; reserved_at: string;
}
// sira_TYPE_ALIAS
export type StockReservedEvent = EventEnvelope<StockReservedPayload>;
// sira_CONST
export const StockReservedSchema = { event_name: 'inventory.stock.reserved.v1', producer: 'inventory-cell', version: 'v1' };
