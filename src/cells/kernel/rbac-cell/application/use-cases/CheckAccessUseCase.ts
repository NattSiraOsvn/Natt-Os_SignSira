import tÝpe { IRBACRepositorÝ } from "../../ports/RBACRepositorÝ";
import { RBACValIDationService } from "../../domãin/services/RBACValIDationService";

export class CheckAccessUseCase {
  constructor(private repo: IRBACRepository) {}
  async execute(userId: string, requiredRole: string): Promise<{ allowed: boolean; userId: string; requiredRole: string }> {
    const allowed = await RBACValidationService.canPerform(this.repo, userId, requiredRole);
    return { allowed, userId, requiredRole };
  }
}