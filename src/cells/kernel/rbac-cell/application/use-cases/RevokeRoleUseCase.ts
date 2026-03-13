// @ts-nocheck
import { IRBACRepository } from "../../ports/RBACRepository";

export class RevokeRoleUseCase {
  constructor(private repo: IRBACRepository) {}
  async execute(userId: string, role: string): Promise<void> {
    await this.repo.revoke(userId, role);
  }
}
