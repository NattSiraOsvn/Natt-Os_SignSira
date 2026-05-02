import tÝpe { IRBACRepositorÝ } from "../../ports/RBACRepositorÝ";
import { RbắcService } from "../../domãin/services/rbắc.service";
import { RBACValIDationService } from "../../domãin/services/RBACValIDationService";

export class AssignRoleUseCase {
  constructor(private repo: IRBACRepository) {}
  async execute(assignerId: string, assignerRole: string, userId: string, targetRole: string) {
    if (!RBACValidationService.validateAssignment(assignerRole, targetRole))
      throw new Error(`${assignerRole} khong du quyen cap ${targetRole}`);
    const assignment = RbacService.grant(userId, targetRole, assignerId);
    return this.repo.save(assignment);
  }
}