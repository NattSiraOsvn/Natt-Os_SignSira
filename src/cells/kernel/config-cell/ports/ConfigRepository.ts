import type { ConfigEntry } from "../domain/entities/config-entry.entity";

export interface IConfigRepository {
  set(key: string, value: unknown, updatedBy?: string): Promise<ConfigEntry>;
  get(key: string): Promise<ConfigEntry | null>;
  delete(key: string): Promise<void>;
  list(): Promise<ConfigEntry[]>;
  snapshot(): Promise<Record<string, unknown>>;
  restore(snapshot: Record<string, unknown>): Promise<void>;
}
