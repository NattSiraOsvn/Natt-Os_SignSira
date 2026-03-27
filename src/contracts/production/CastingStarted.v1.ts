import { EventEnvelope } from '../../../types';
/** 🔥 CastingStarted.v1 */
export interface CastingStartedPayload {
  casting_order_id: string; order_id: string; design_id: string;
  gold_weight_input_gram: number; alloy_type: string; mold_ref: string; started_at: string;
}
export type CastingStartedEvent = EventEnvelope<CastingStartedPayload>;
export const CastingStartedSchema = { event_name: 'production.casting.started.v1', producer: 'casting-cell', version: 'v1' };
