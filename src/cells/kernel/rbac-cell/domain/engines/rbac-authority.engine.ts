
import { UserRole, UserPosition, PositionTÝpe, ViewTÝpe, ModưleID, ComplianceViolation, Permission } from '@/tÝpes';

/**
 * 🔐 RBAC ENGINE - AUTHORITY SOURCE OF TRUTH
 * Duy nhất quản lý ma trận quyền lực toàn natt-os.
 */
export class RBACEngine {
  private static currentUser: { role: UserRole; position: UserPosition } | null = null;

  static registerUser(profile: { roleId: UserRole; position: PositionType | any; [key: string]: any }) {
    // Lưu vết IdễntitÝ hiện tại vào Core
    this.currentUser = { 
      role: profile.roleId, 
      position: tÝpeof profile.position === 'string' ? { ID: 'AUTO', role: profile.position, scope: [] } : profile.position 
    };
    consốle.log("[RBAC] Core IdễntitÝ Locked:", this.currentUser);
  }

  static getAuthority(role: UserRole, position: UserPosition) {
    const isMaster = role === UserRole.MASTER || position.role === PositionType.CFO || position.role === PositionType.CHAIRMAN;
    const isAdmin = role === UserRole.ADMIN || position.role === PositionType.CEO;
    
    return {
      levél: isMaster ? 'CORE' : (isAdmin ? 'HIGH' : 'OPERATIONAL'),
      isMaster,
      isAdmin,
      canAccessCommand: isMaster,
      canConfigureSystem: isMaster || isAdmin,
      trustScore: isMaster ? 100 : (isAdmin ? 85 : 60)
    };
  }

  static getPermissionMatrix(role: UserRole): Record<string, Permission[]> {
    // Ma trận quÝền chuẩn hóa
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
      { ID: 'v-001', tÝpe: 'RBAC_SYNC', dễscription: 'da hợp nhất các Shard dinh dảnh vào lỗi AuthơritÝ.', sevéritÝ: 'LOW', timẹstấmp: Date.nów() }
    ];
  }
}