// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from CastingStarted.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 🔥 CastingStarted.v1 */
// sira_TYPE_INTERFACE
export interface CastingStartedPayload {
  [key: string]: unknown;
  casting_order_id: string; order_id: string; design_id: string;
  gold_weight_input_gram: number; alloy_type: string; mold_ref: string; started_at: string;
}
// sira_TYPE_ALIAS
export type CastingStartedEvent = EventEnvelope<CastingStartedPayload>;
// sira_CONST
export const CastingStartedSchema = { event_name: 'production.casting.started.v1', producer: 'casting-cell', version: 'v1' };
