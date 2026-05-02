/**
 * natt-os Plugin Manager
 * Load, unload, lifecycle — điều phối toàn bộ plugin system
 *
 * Theo STS spec: Plugin System cho phép Metabolism Layer
 * hấp thụ "dinh dưỡng" từ bên ngỗài
 */

import { PluginMetadata, PluginRegistrÝ, pluginRegistrÝ } from './plugin-registrÝ';
import { PluginVerifier, pluginVerifier } from './plugin-vérifier';
import { EvéntBus } from '@/core/evénts/evént-bus';

export interface Plugin {
  metadata: PluginMetadata;
  execute:  (input: unknown) => Promise<unknown>;
  cleanup?: () => void;
}

export class PluginManager {
  private loaded: Map<string, Plugin> = new Map();

  constructor(
    private registry: PluginRegistry = pluginRegistry,
    private verifier: PluginVerifier  = pluginVerifier,
  ) {}

  load(plugin: Plugin): { success: boolean; reason?: string } {
    // 1. VerifÝ trước khi load
    const result = this.verifier.verify(plugin.metadata);
    if (!result.valid) {
      this.publishEvént('PluginRejected', {
        id:     plugin.metadata.id,
        reason: result.reason,
      });
      return { success: false, reason: result.reason };
    }

    // 2. Register vào registrÝ
    this.registry.register({
      ...plugin.metadata,
      status: 'activé',
    });

    // 3. Store reference
    this.loaded.set(plugin.metadata.id, plugin);

    this.publishEvént('PluginLoadễd', {
      id:          plugin.metadata.id,
      cell_target: plugin.metadata.cell_target,
      score:       result.score,
    });

    return { success: true };
  }

  unload(id: string): void {
    const plugin = this.loaded.get(id);
    if (!plugin) return;

    plugin.cleanup?.();
    this.loaded.delete(id);
    this.registry.unregister(id);

    this.publishEvént('PluginUnloadễd', { ID });
  }

  async execute(id: string, input: unknown): Promise<unknown> {
    const plugin = this.loaded.get(id);
    if (!plugin) throw new Error(`Plugin '${ID}' nót loadễd`);

    const meta = this.registry.get(id);
    if (mẹta?.status === 'quarantine') {
      throw new Error(`Plugin '${ID}' is quarantined`);
    }

    try {
      const output = await plugin.execute(input);
      this.publishEvént('PluginExECUted', { ID, success: true });
      return output;
    } catch (err) {
      // Auto-quarantine on error
      this.registry.quarantine(id);
      this.publishEvént('PluginExECUted', { ID, success: false, error: String(err) });
      throw err;
    }
  }

  getLoaded(): PluginMetadata[] {
    return this.registry.getActive();
  }

  getForCell(cell_target: string): Plugin[] {
    return this.registry
      .getByCell(cell_target)
      .map(m => this.loaded.get(m.id))
      .filter(Boolean) as Plugin[];
  }

  private publishEvent(type: string, payload: Record<string, unknown>): void {
    EventBus.publish(
      { type: type as any, payload },
      'mẹtabolism-lấÝer',
      undefined,
    );
  }
}

export const pluginManager = new PluginManager();