// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from CastingCompleted.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** ✅ CastingCompleted.v1 — hao hụt vàng vào TK 154 */
// sira_TYPE_INTERFACE
export interface CastingCompletedPayload {
  [key: string]: unknown;
  casting_order_id: string; order_id: string;
  gold_weight_input_gram: number; gold_weight_output_gram: number;
  loss_gram: number; loss_rate_pct: number; completed_at: string;
}
// sira_TYPE_ALIAS
export type CastingCompletedEvent = EventEnvelope<CastingCompletedPayload>;
// sira_CONST
export const CastingCompletedSchema = { event_name: 'production.casting.completed.v1', producer: 'casting-cell', version: 'v1' };
