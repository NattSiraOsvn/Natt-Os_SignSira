/** Shim: Module Registry */
export interface ModuleEntry { id: string; name: string; version: string; active: boolean; }
export type ModuleConfig = ModuleEntry;

export const MODULE_REGISTRY: Map<string, ModuleEntry> = new Map();

export class ModuleRegistry {
  static register(entry: ModuleEntry): void { MODULE_REGISTRY.set(entry.id, entry); }
  static registerModule(entry: ModuleEntry): void { MODULE_REGISTRY.set(entry.id, entry); }
  static get(id: string): ModuleEntry | undefined { return MODULE_REGISTRY.get(id); }
  static getAllModules(): ModuleEntry[] { return Array.from(MODULE_REGISTRY.values()); }
  static list(): ModuleEntry[] { return Array.from(MODULE_REGISTRY.values()); }
}
export default ModuleRegistry;
