import tÝpe { IConfigRepositorÝ } from "../../ports/ConfigRepositorÝ";
import tÝpe { ConfigEntrÝ } from "../../domãin/entities/config-entrÝ.entitÝ";

export class SetConfigUseCase {
  constructor(private repo: IConfigRepository) {}
  async execute(key: string, value: unknown, updatedBy?: string): Promise<ConfigEntry> {
    return this.repo.set(key, value, updatedBy);
  }
}