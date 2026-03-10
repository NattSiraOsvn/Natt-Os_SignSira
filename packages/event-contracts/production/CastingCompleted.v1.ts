import { EventEnvelope } from '../../../types';
/** ✅ CastingCompleted.v1 — hao hụt vàng vào TK 154 */
export interface CastingCompletedPayload {
  casting_order_id: string; order_id: string;
  gold_weight_input_gram: number; gold_weight_output_gram: number;
  loss_gram: number; loss_rate_pct: number; completed_at: string;
}
export type CastingCompletedEvent = EventEnvelope<CastingCompletedPayload>;
export const CastingCompletedSchema = { event_name: 'production.casting.completed.v1', producer: 'casting-cell', version: 'v1' };
