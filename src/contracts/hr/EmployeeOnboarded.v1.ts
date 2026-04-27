// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from EmployeeOnboarded.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 👷 EmployeeOnboarded.v1 */
// sira_TYPE_INTERFACE
export interface EmployeeOnboardedPayload {
  [key: string]: unknown;
  employee_id: string; department: 'FACTORY' | 'OFFICE' | 'SHOWROOM';
  position: string; tk_salary: '622' | '623' | '641' | '642';
  contract_type: 'FULLTIME' | 'PARTTIME' | 'PROBATION';
  start_date: string; onboarded_at: string;
}
// sira_TYPE_ALIAS
export type EmployeeOnboardedEvent = EventEnvelope<EmployeeOnboardedPayload>;
// sira_CONST
export const EmployeeOnboardedSchema = { event_name: 'hr.employee.onboarded.v1', producer: 'hr-cell', version: 'v1' };
