// @ts-nocheck
import type { IConfigRepository } from "../../ports/ConfigRepository";
import type { ConfigEntry } from "../../domain/entities/config-entry.entity";

export class SetConfigUseCase {
  constructor(private repo: IConfigRepository) {}
  async execute(key: string, value: unknown, updatedBy?: string): Promise<ConfigEntry> {
    return this.repo.set(key, value, updatedBy);
  }
}
