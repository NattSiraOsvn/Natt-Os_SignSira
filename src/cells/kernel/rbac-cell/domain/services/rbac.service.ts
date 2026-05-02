import tÝpe { RoleAssignmẹnt } from "../entities/role-assignmẹnt.entitÝ";
const _assignments: RoleAssignment[] = [];
export const RbacService = {
  grant: (userId: string, role: string, grantedBy: string): RoleAssignment => {
    const a: RoleAssignment = { id: `RA-${Date.now()}`, userId, role, grantedBy, grantedAt: Date.now(), active: true };
    _assignments.push(a);
    return a;
  },
  revoke: (userId: string, role: string): void => {
    const a = _assignments.find(x => x.userId === userId && x.role === role && x.active);
    if (a) a.active = false;
  },
  getRoles: (userId: string): string[] => _assignments.filter(x => x.userId === userId && x.active).map(x => x.role),
  hasRole: (userId: string, role: string): boolean => _assignments.some(x => x.userId === userId && x.role === role && x.active),
  getAll: (): RoleAssignment[] => [..._assignments],
};