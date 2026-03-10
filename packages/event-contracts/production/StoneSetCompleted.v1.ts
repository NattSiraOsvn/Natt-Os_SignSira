import { EventEnvelope } from '../../../types';
/** 💎 StoneSetCompleted.v1 */
export interface StoneSetCompletedPayload {
  stone_order_id: string; order_id: string; casting_order_id: string;
  diamonds: Array<{ stone_id: string; type: 'MELEE' | 'CENTER'; carat_weight: number; quantity: number }>;
  completed_at: string;
}
export type StoneSetCompletedEvent = EventEnvelope<StoneSetCompletedPayload>;
export const StoneSetCompletedSchema = { event_name: 'production.stone.set_completed.v1', producer: 'stone-cell', version: 'v1' };
