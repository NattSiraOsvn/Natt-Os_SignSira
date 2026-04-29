import type { IConfigRepository } from "../../ports/configrepository";
import type { ConfigEntry } from "../../domain/entities/config-entry.entity";
import { ConfigStoreService } from "../../domain/services/config-store.service";

export class InMemoryConfigRepository implements IConfigRepository {
  async set(key: string, value: unknown, updatedBy = "SYSTEM"): Promise<ConfigEntry> {
    return ConfigStoreService.set(key, value, updatedBy);
  }
  async get(key: string): Promise<ConfigEntry | null>  { return ConfigStoreService.getEntry(key); }
  async delete(key: string): Promise<void>             { ConfigStoreService.delete(key); }
  async list(): Promise<ConfigEntry[]>                 { return ConfigStoreService.list(); }
  async snapshot(): Promise<Record<string, unknown>> {
    return Object.fromEntries(ConfigStoreService.list().map(e => [e.key, e.value]));
  }
  async restore(snap: Record<string, unknown>): Promise<void> {
    Object.entries(snap).forEach(([k, v]) => ConfigStoreService.set(k, v, "RESTORE"));
  }
}

export const configRepository = new InMemoryConfigRepository();

// Patch: thêm exists() cho ConfigCell.ts
export async function configExists(key: string): Promise<boolean> {
  const entry = ConfigStoreService.getEntry(key);
  return entry !== null;
}
