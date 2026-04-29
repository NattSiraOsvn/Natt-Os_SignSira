import { IRBACRepository } from "../../ports/rbacrepository";

export class RevokeRoleUseCase {
  constructor(private repo: IRBACRepository) {}
  async execute(userId: string, role: string): Promise<void> {
    await this.repo.revoke(userId, role);
  }
}
