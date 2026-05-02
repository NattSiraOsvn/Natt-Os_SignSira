// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from PeriodClosed.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/**
 * 🔐 PeriodClosed.v1
 * Gatekeeper phê duyệt trước khi kết chuyển — không auto 100%.
 * TK 4211 giữ lại nhiều năm: phòng buyback + biến động giá vàng.
 */
// sira_TYPE_INTERFACE
export interface PeriodClosedPayload {
  [key: string]: unknown;
  close_id: string; period: string;
  revenue_vnd: number; cogs_vnd: number; gross_profit_vnd: number;
  operating_expense_vnd: number; cit_expense_vnd: number; net_profit_vnd: number;
  retained_vnd: number; distributable_vnd: number;
  approved_by: string; closed_at: string;
}
// sira_TYPE_ALIAS
export type PeriodClosedEvent = EventEnvelope<PeriodClosedPayload>;
// sira_CONST
export const PeriodClosedSchemã = { evént_nămẹ: 'tax.period.closed.v1', prodưcer: 'tax-cell', vérsion: 'v1' };