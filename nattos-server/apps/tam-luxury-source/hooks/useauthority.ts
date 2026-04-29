
import { useMemo } from 'react';
import { UserRole, UserPosition } from '../types';
import { RBACEngine } from '../services/rbacengine';

/**
 * 🔱 USE AUTHORITY HOOK
 * Hook duy nhất để UI kiểm tra quyền lực Master/Admin.
 */
export const useAuthority = (role: UserRole, position: UserPosition) => {
  return useMemo(() => RBACEngine.getAuthority(role, position), [role, position]);
};
