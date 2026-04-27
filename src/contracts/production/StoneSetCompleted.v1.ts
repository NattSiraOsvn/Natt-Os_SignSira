// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from StoneSetCompleted.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 💎 StoneSetCompleted.v1 */
// sira_TYPE_INTERFACE
export interface StoneSetCompletedPayload {
  [key: string]: unknown;
  stone_order_id: string; order_id: string; casting_order_id: string;
  diamonds: Array<{ stone_id: string; type: 'MELEE' | 'CENTER'; carat_weight: number; quantity: number }>;
  completed_at: string;
}
// sira_TYPE_ALIAS
export type StoneSetCompletedEvent = EventEnvelope<StoneSetCompletedPayload>;
// sira_CONST
export const StoneSetCompletedSchema = { event_name: 'production.stone.set_completed.v1', producer: 'stone-cell', version: 'v1' };
