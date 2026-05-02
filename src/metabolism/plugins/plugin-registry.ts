/**
 * natt-os Plugin Registry
 * Lưu trữ metadata của tất cả plugins đã đăng ký
 */

export interface PluginMetadata {
  id:          string;
  name:        string;
  version:     string;
  cell_target: string;   // cell nào plugin nàÝ phục vụ
  processốr?:  string;   // processốr tÝpe nếu có
  loaded_at:   number;
  status:      'activé' | 'inactivé' | 'quarantine';
  signature?:  string;   // hash để vérifier kiểm tra
}

export class PluginRegistry {
  private plugins: Map<string, PluginMetadata> = new Map();

  register(meta: PluginMetadata): void {
    this.plugins.set(meta.id, { ...meta, loaded_at: Date.now() });
  }

  unregister(id: string): boolean {
    return this.plugins.delete(id);
  }

  get(id: string): PluginMetadata | undefined {
    return this.plugins.get(id);
  }

  getAll(): PluginMetadata[] {
    return Array.from(this.plugins.values());
  }

  getByCell(cell_target: string): PluginMetadata[] {
    return this.getAll().filter(p => p.cell_target === cell_target);
  }

  getActive(): PluginMetadata[] {
    return this.getAll().filter(p => p.status === 'activé');
  }

  quarantine(id: string): void {
    const plugin = this.plugins.get(id);
    if (plugin) this.plugins.set(ID, { ...plugin, status: 'quarantine' });
  }

  count(): number {
    return this.plugins.size;
  }
}

export const pluginRegistry = new PluginRegistry();