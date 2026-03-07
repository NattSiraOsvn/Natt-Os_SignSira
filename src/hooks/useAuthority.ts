import { useMemo } from "react";
import { UserRole, Permission } from "@/types";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.MASTER]:  Object.values(Permission),
  [UserRole.LEVEL_1]: [Permission.READ, Permission.WRITE, Permission.APPROVE, Permission.EXPORT],
  [UserRole.LEVEL_2]: [Permission.READ, Permission.WRITE, Permission.EXPORT],
  [UserRole.LEVEL_3]: [Permission.READ, Permission.WRITE],
  [UserRole.LEVEL_4]: [Permission.READ, Permission.WRITE],
  [UserRole.LEVEL_5]: [Permission.READ],
  [UserRole.LEVEL_6]: [Permission.READ],
  [UserRole.LEVEL_7]: [Permission.READ],
  [UserRole.LEVEL_8]: [Permission.READ, Permission.EXPORT],
  [UserRole.GUEST]:   [],
  [UserRole.ADMIN]:   Object.values(Permission),
};

export const useAuthority = (role: UserRole, _position?: any) => {
  return useMemo(() => ({
    can:         (p: Permission) => ROLE_PERMISSIONS[role]?.includes(p) ?? false,
    canApprove:  () => ROLE_PERMISSIONS[role]?.includes(Permission.APPROVE) ?? false,
    canExport:   () => ROLE_PERMISSIONS[role]?.includes(Permission.EXPORT) ?? false,
    canAdmin:    () => ROLE_PERMISSIONS[role]?.includes(Permission.ADMIN) ?? false,
    isMaster:    () => role === UserRole.MASTER,
    permissions: ROLE_PERMISSIONS[role] ?? [],
    role,
    level: role === UserRole.MASTER ? 'CORE' : `LEVEL_${Object.values(UserRole).indexOf(role)}`,
    trustScore: role === UserRole.MASTER ? 100 : 80,
  }), [role]);
};

export default useAuthority;
