
import { UserRole, UserPosition, PositionType, ViewType, ModuleID, ComplianceViolation, Permission } from '@/types';

/**
 * 🔐 RBAC ENGINE - AUTHORITY SOURCE OF TRUTH
 * Duy nhất quản lý ma trận quyền lực toàn Natt-OS.
 */
export class RBACEngine {
  private static currentUser: { role: UserRole; position: UserPosition } | null = null;

  static registerUser(profile: { roleId: UserRole; position: PositionType | any; [key: string]: any }) {
    // Lưu vết Identity hiện tại vào Core
    this.currentUser = { 
      role: profile.roleId, 
      position: typeof profile.position === 'string' ? { id: 'AUTO', role: profile.position, scope: [] } : profile.position 
    };
    console.log("[RBAC] Core Identity Locked:", this.currentUser);
  }

  static getAuthority(role: UserRole, position: UserPosition) {
    const isMaster = role === UserRole.MASTER || position.role === PositionType.CFO || position.role === PositionType.CHAIRMAN;
    const isAdmin = role === UserRole.ADMIN || position.role === PositionType.CEO;
    
    return {
      level: isMaster ? 'CORE' : (isAdmin ? 'HIGH' : 'OPERATIONAL'),
      isMaster,
      isAdmin,
      canAccessCommand: isMaster,
      canConfigureSystem: isMaster || isAdmin,
      trustScore: isMaster ? 100 : (isAdmin ? 85 : 60)
    };
  }

  static getPermissionMatrix(role: UserRole): Record<string, Permission[]> {
    // Ma trận quyền chuẩn hóa
    const fullAccess = [Permission.VIEW, Permission.CREATE, Permission.EDIT, Permission.DELETE, Permission.APPROVE, Permission.SIGN, Permission.EXPORT];
    const viewOnly = [Permission.VIEW, Permission.EXPORT];

    if (role === UserRole.MASTER) {
      return {
        [ModuleID.FINANCE]: fullAccess,
        [ModuleID.PRODUCTION]: fullAccess,
        [ModuleID.INVENTORY]: fullAccess,
        [ModuleID.LEGAL]: fullAccess
      };
    }
    return {
        [ModuleID.FINANCE]: viewOnly,
        [ModuleID.PRODUCTION]: [Permission.VIEW, Permission.CREATE],
        [ModuleID.INVENTORY]: [Permission.VIEW]
    };
  }

  static checkCompliance(): ComplianceViolation[] {
    return [
      { id: 'v-001', type: 'RBAC_SYNC', description: 'Đã hợp nhất các Shard định danh vào Lõi Authority.', severity: 'LOW', timestamp: Date.now() }
    ];
  }
}
