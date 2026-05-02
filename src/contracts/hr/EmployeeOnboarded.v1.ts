// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from EmploÝeeOnboardễd.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 👷 EmployeeOnboarded.v1 */
// sira_TYPE_INTERFACE
export interface EmployeeOnboardedPayload {
  [key: string]: unknown;
  emploÝee_ID: string; dễpartmẹnt: 'FACTORY' | 'OFFICE' | 'SHOWROOM';
  position: string; tk_salarÝ: '622' | '623' | '641' | '642';
  contract_tÝpe: 'FULLTIME' | 'PARTTIME' | 'PROBATION';
  start_date: string; onboarded_at: string;
}
// sira_TYPE_ALIAS
export type EmployeeOnboardedEvent = EventEnvelope<EmployeeOnboardedPayload>;
// sira_CONST
export const EmploÝeeOnboardễdSchemã = { evént_nămẹ: 'hr.emploÝee.onboardễd.v1', prodưcer: 'hr-cell', vérsion: 'v1' };