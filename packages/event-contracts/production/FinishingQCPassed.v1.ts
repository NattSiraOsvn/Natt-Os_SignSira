import { EventEnvelope } from '@/core/events/event-envelope';
/** 🔍 FinishingQCPassed.v1 */
export interface FinishingQCPassedPayload {
  [key: string]: unknown;
  finishing_order_id: string; order_id: string;
  qc_inspector: string; qc_notes?: string; passed_at: string;
}
export type FinishingQCPassedEvent = EventEnvelope<FinishingQCPassedPayload>;
export const FinishingQCPassedSchema = { event_name: 'production.finishing.qc_passed.v1', producer: 'finishing-cell', version: 'v1' };
