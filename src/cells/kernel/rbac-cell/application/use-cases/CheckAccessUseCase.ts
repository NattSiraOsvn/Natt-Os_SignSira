import type { IRBACRepository } from "../../ports/rbacrepository";
import { RBACValidationService } from "../../domain/services/rbacvalidationservice";

export class CheckAccessUseCase {
  constructor(private repo: IRBACRepository) {}
  async execute(userId: string, requiredRole: string): Promise<{ allowed: boolean; userId: string; requiredRole: string }> {
    const allowed = await RBACValidationService.canPerform(this.repo, userId, requiredRole);
    return { allowed, userId, requiredRole };
  }
}
