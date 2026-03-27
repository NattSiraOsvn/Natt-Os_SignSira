import { EventEnvelope } from '../../../types';
/** 👷 EmployeeOnboarded.v1 */
export interface EmployeeOnboardedPayload {
  employee_id: string; department: 'FACTORY' | 'OFFICE' | 'SHOWROOM';
  position: string; tk_salary: '622' | '623' | '641' | '642';
  contract_type: 'FULLTIME' | 'PARTTIME' | 'PROBATION';
  start_date: string; onboarded_at: string;
}
export type EmployeeOnboardedEvent = EventEnvelope<EmployeeOnboardedPayload>;
export const EmployeeOnboardedSchema = { event_name: 'hr.employee.onboarded.v1', producer: 'hr-cell', version: 'v1' };
