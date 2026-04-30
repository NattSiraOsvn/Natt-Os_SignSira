import type { IConfigRepository } from "../../ports/ConfigRepository";

export class RollbackConfigUseCase {
  constructor(private repo: IConfigRepository) {}
  async execute(snapshot: Record<string, unknown>): Promise<{ restored: number }> {
    await this.repo.restore(snapshot);
    return { restored: Object.keys(snapshot).length };
  }
}
