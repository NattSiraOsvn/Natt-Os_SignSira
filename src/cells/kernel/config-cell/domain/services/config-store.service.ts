import type { ConfigEntry } from "../entities/config-entry.entity";
const _store = new Map<string, ConfigEntry>();
export const ConfigStoreService = {
  set: (key: string, value: unknown, updatedBy = "SYSTEM"): ConfigEntry => {
    const prev = _store.get(key);
    const entry: ConfigEntry = { key, value, version: (prev?.version ?? 0) + 1, updatedAt: Date.now(), updatedBy, encrypted: false };
    _store.set(key, entry);
    return entry;
  },
  get: <T = unknown>(key: string): T | null => (_store.get(key)?.value as T) ?? null,
  getEntry: (key: string): ConfigEntry | null => _store.get(key) ?? null,
  delete: (key: string): void => { _store.delete(key); },
  list: (): ConfigEntry[] => [..._store.values()],
  getVersion: (key: string): number => _store.get(key)?.version ?? 0,
};
