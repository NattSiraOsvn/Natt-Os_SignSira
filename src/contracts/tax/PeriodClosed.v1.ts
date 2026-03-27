import { EventEnvelope } from '@/core/events/event-envelope';
/**
 * 🔐 PeriodClosed.v1
 * Gatekeeper phê duyệt trước khi kết chuyển — không auto 100%.
 * TK 4211 giữ lại nhiều năm: phòng buyback + biến động giá vàng.
 */
export interface PeriodClosedPayload {
  [key: string]: unknown;
  close_id: string; period: string;
  revenue_vnd: number; cogs_vnd: number; gross_profit_vnd: number;
  operating_expense_vnd: number; cit_expense_vnd: number; net_profit_vnd: number;
  retained_vnd: number; distributable_vnd: number;
  approved_by: string; closed_at: string;
}
export type PeriodClosedEvent = EventEnvelope<PeriodClosedPayload>;
export const PeriodClosedSchema = { event_name: 'tax.period.closed.v1', producer: 'tax-cell', version: 'v1' };
