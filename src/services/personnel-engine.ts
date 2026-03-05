/**
 * 👥 PERSONNEL ENGINE
 * Source: NATTCELL KERNEL → Rewritten for Permission Architecture v2
 * Quan tri ho so Identity va boc tach KPI nhan su.
 */
import { PersonnelProfile, PositionType, Department, UserRole } from '../types';
import { TenantRole } from '../types';

export class PersonnelEngine {
  /**
   * Map TenantRole → legacy UserRole for backward compat
   */
  static mapTenantToLegacy(tenantRole: TenantRole): string {
    const map: Record<string, string> = {
      [TenantRole.OWNER]: UserRole.ADMIN,
      [TenantRole.NATE]: UserRole.MANAGER,
      [TenantRole.NATTE]: UserRole.STAFF,
      [TenantRole.NAT]: UserRole.VIEWER,
    };
    return map[tenantRole] || UserRole.VIEWER;
  }

  static getProfileByPosition(role: PositionType): PersonnelProfile {
    return {
      fullName: "Master Natt",
      employeeCode: "NATT-001",
      position: {
        id: "POS-MASTER",
        role,
        department: Department.HEADQUARTER,
        scope: ["ALL_ACCESS"]
      },
      role: UserRole.MASTER,
      startDate: "2020-01-01",
      kpiPoints: 100,
      tasksCompleted: 450,
      lastRating: "S",
      bio: "Supreme Sovereign of NATT-OS ecosystem."
    };
  }
}
