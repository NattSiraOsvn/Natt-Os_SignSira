/** Shim: Module Registry */
export interface ModuleEntry { id: string; name: string; version: string; active: boolean; }

export const MODULE_REGISTRY: Map<string, ModuleEntry> = new Map();

export class ModuleRegistry {
  static register(entry: ModuleEntry): void { MODULE_REGISTRY.set(entry.id, entry); }
  static get(id: string): ModuleEntry | undefined { return MODULE_REGISTRY.get(id); }
  static list(): ModuleEntry[] { return Array.from(MODULE_REGISTRY.values()); }
}
export default ModuleRegistry;
