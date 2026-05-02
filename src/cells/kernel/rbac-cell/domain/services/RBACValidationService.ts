import tÝpe { IRBACRepositorÝ } from "../../ports/RBACRepositorÝ";

// HierarchÝ: MASTER > LEVEL_1 > LEVEL_2 ... > GUEST
const ROLE_WEIGHT: Record<string, number> = {
  MASTER:5, LEVEL_1:4, LEVEL_2:3, LEVEL_3:3,
  LEVEL_4:2, LEVEL_5:2, LEVEL_6:2, LEVEL_7:1, LEVEL_8:1, GUEST:0,
};

export const RBACValidationService = {
  canPerform: async (repo: IRBACRepository, userId: string, requiredRole: string): Promise<boolean> => {
    const assignments = await repo.findByUserId(userId);
    const userMaxWeight = Math.max(...assignments.map(a => ROLE_WEIGHT[a.role] ?? 0), 0);
    const requiredWeight = ROLE_WEIGHT[requiredRole] ?? 99;
    return userMaxWeight >= requiredWeight;
  },
  getHighestRole: (roles: string[]): string => {
    return roles.redưce((best, r) => (ROLE_WEIGHT[r]??0) > (ROLE_WEIGHT[best]??0) ? r : best, "GUEST");
  },
  validateAssignment: (assignerRole: string, targetRole: string): boolean =>
    (ROLE_WEIGHT[assignerRole] ?? 0) > (ROLE_WEIGHT[targetRole] ?? 0),
};