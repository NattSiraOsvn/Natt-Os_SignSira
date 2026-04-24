// hr-cell/index.ts
// Wave B — Re-export + trigger seed on load

export { HREngine } from './domain/services/hr.seed';
export { PersonnelEngine } from './domain/services/personnel.engine';
export { HRSmartLinkPort } from './ports/hr-SmartLink.port';
export type { Employee, EmployeeStatus, ProductionGroup, HR_FIELDS_LEVELS } from './domain/entities/employee.entity';
export type { PayslipEntry } from './domain/services/hr.engine';
