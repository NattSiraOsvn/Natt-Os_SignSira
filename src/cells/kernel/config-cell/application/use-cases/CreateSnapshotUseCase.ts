// @ts-nocheck
import type { IConfigRepository } from "../../ports/ConfigRepository";

export class CreateSnapshotUseCase {
  constructor(private repo: IConfigRepository) {}
  async execute(): Promise<{ snapshot: Record<string, unknown>; createdAt: number }> {
    return { snapshot: await this.repo.snapshot(), createdAt: Date.now() };
  }
}
