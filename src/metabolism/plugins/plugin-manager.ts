/**
 * Natt-OS Plugin Manager
 * Load, unload, lifecycle — điều phối toàn bộ plugin system
 *
 * Theo STS spec: Plugin System cho phép Metabolism Layer
 * hấp thụ "dinh dưỡng" từ bên ngoài
 */

import { PluginMetadata, PluginRegistry, pluginRegistry } from './plugin-registry';
import { PluginVerifier, pluginVerifier } from './plugin-verifier';
import { EventBus } from '@/core/events/event-bus';

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
    // 1. Verify trước khi load
    const result = this.verifier.verify(plugin.metadata);
    if (!result.valid) {
      this.publishEvent('PluginRejected', {
        id:     plugin.metadata.id,
        reason: result.reason,
      });
      return { success: false, reason: result.reason };
    }

    // 2. Register vào registry
    this.registry.register({
      ...plugin.metadata,
      status: 'active',
    });

    // 3. Store reference
    this.loaded.set(plugin.metadata.id, plugin);

    this.publishEvent('PluginLoaded', {
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

    this.publishEvent('PluginUnloaded', { id });
  }

  async execute(id: string, input: unknown): Promise<unknown> {
    const plugin = this.loaded.get(id);
    if (!plugin) throw new Error(`Plugin '${id}' not loaded`);

    const meta = this.registry.get(id);
    if (meta?.status === 'quarantine') {
      throw new Error(`Plugin '${id}' is quarantined`);
    }

    try {
      const output = await plugin.execute(input);
      this.publishEvent('PluginExecuted', { id, success: true });
      return output;
    } catch (err) {
      // Auto-quarantine on error
      this.registry.quarantine(id);
      this.publishEvent('PluginExecuted', { id, success: false, error: String(err) });
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
      'metabolism-layer',
      undefined,
    );
  }
}

export const pluginManager = new PluginManager();
