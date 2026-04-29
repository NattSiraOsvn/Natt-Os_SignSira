import type { IRBACRepository } from "../../ports/rbacrepository";
import { RbacService } from "../../domain/services/rbac.service";
import { RBACValidationService } from "../../domain/services/rbacvalidationservice";

export class AssignRoleUseCase {
  constructor(private repo: IRBACRepository) {}
  async execute(assignerId: string, assignerRole: string, userId: string, targetRole: string) {
    if (!RBACValidationService.validateAssignment(assignerRole, targetRole))
      throw new Error(`${assignerRole} khong du quyen cap ${targetRole}`);
    const assignment = RbacService.grant(userId, targetRole, assignerId);
    return this.repo.save(assignment);
  }
}
