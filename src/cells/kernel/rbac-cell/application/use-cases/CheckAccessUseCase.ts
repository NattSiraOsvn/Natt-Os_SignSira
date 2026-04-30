import type { IRBACRepository } from "../../ports/RBACRepository";
import { RBACValidationService } from "../../domain/services/RBACValidationService";

export class CheckAccessUseCase {
  constructor(private repo: IRBACRepository) {}
  async execute(userId: string, requiredRole: string): Promise<{ allowed: boolean; userId: string; requiredRole: string }> {
    const allowed = await RBACValidationService.canPerform(this.repo, userId, requiredRole);
    return { allowed, userId, requiredRole };
  }
}
