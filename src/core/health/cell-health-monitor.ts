/**
 * natt-os CellHealthMonitor
 * Patent Claim: Autonomous self-healing distributed cell network with
 *               dynamic discovery, heartbeat monitoring, and automatic rerouting.
 *
 * Mechanism:
 *   1. Cells register with heartbeat interval
 *   2. Monitor detects missed heartbeats → marks DEGRADED
 *   3. After threshold → marks OFFLINE → triggers reroute via DeterministicRouter
 *   4. On recovery → auto-reintegrates → marks HEALTHY
 */

import { Router } from '@/core/routing/deterministic-router';

export type CellStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';

export interface CellRegistration {
  cellId: string;
  cellType: 'BUSINESS' | 'KERNEL' | 'INFRASTRUCTURE';
  capabilities: string[];       // What this cell can handle
  heartbeatIntervalMs: number;  // Expected heartbeat frequency
  policySignature: string;
  weight: number;
}

export interface CellHealthRecord {
  cellId: string;
  status: CellStatus;
  lastHeartbeat: number;
  consecutiveMisses: number;
  uptime: number;              // ms since first registered
  registeredAt: number;
  recoveryCount: number;       // How many times auto-healed
  capabilities: string[];
}

const MISS_THRESHOLD_DEGRADED = 2;
const MISS_THRESHOLD_CRITICAL  = 4;
const MISS_THRESHOLD_OFFLINE   = 6;

export class CellHealthMonitor {
  private static instance: CellHealthMonitor;
  private cells: Map<string, CellHealthRecord> = new Map();
  private registrations: Map<string, CellRegistration> = new Map();
  private monitorInterval: ReturnType<typeof setInterval> | null = null;
  private healingCallbacks: Map<string, () => Promise<void>> = new Map();

  static getInstance(): CellHealthMonitor {
    if (!this.instance) this.instance = new CellHealthMonitor();
    return this.instance;
  }

  /** Dynamic cell discovery — cells self-register at boot */
  register(reg: CellRegistration, healFn?: () => Promise<void>): void {
    const now = Date.now();
    this.registrations.set(reg.cellId, reg);
    this.cells.set(reg.cellId, {
      cellId: reg.cellId,
      status: 'HEALTHY',
      lastHeartbeat: now,
      consecutiveMisses: 0,
      uptime: 0,
      registeredAt: now,
      recoveryCount: 0,
      capabilities: reg.capabilities,
    });
    if (healFn) this.healingCallbacks.set(reg.cellId, healFn);

    // Register with router for automatic rerouting
    for (const cap of reg.capabilities) {
      Router.register(cap, {
        cellId: reg.cellId,
        module: reg.cellId,
        weight: reg.weight,
        policySignature: reg.policySignature,
        healthy: true,
        lastHeartbeat: now,
      });
    }
    console.log(`[HEALTH] Cell registered: ${reg.cellId} (${reg.capabilities.join(', ')})`);
  }

  /** Cell reports it is alive */
  heartbeat(cellId: string): void {
    const record = this.cells.get(cellId);
    if (!record) return;
    const wasOffline = record.status === 'OFFLINE';
    record.lastHeartbeat = Date.now();
    record.consecutiveMisses = 0;
    record.status = 'HEALTHY';
    if (wasOffline) {
      record.recoveryCount++;
      Router.markHealthy(cellId);
      console.log(`[HEALTH] ✅ Auto-recovered: ${cellId} (recovery #${record.recoveryCount})`);
    }
  }

  /** Start autonomous monitoring loop */
  startMonitoring(intervalMs = 5000): void {
    if (this.monitorInterval) return;
    this.monitorInterval = setInterval(() => this._runHealthCheck(), intervalMs);
    console.log('[HEALTH] Monitor started');
  }

  stopMonitoring(): void {
    if (this.monitorInterval) { clearInterval(this.monitorInterval); this.monitorInterval = null; }
  }

  private async _runHealthCheck(): Promise<void> {
    const now = Date.now();
    for (const [cellId, record] of this.cells) {
      const reg = this.registrations.get(cellId)!;
      const elapsed = now - record.lastHeartbeat;
      const missedIntervals = Math.floor(elapsed / reg.heartbeatIntervalMs);

      if (missedIntervals > 0) {
        record.consecutiveMisses = missedIntervals;
        const prev = record.status;

        if (missedIntervals >= MISS_THRESHOLD_OFFLINE) {
          record.status = 'OFFLINE';
          Router.markUnhealthy(cellId);
          // Attempt self-healing
          const heal = this.healingCallbacks.get(cellId);
          if (heal) { try { await heal(); } catch {} }
        } else if (missedIntervals >= MISS_THRESHOLD_CRITICAL) {
          record.status = 'CRITICAL';
        } else if (missedIntervals >= MISS_THRESHOLD_DEGRADED) {
          record.status = 'DEGRADED';
        }

        if (prev !== record.status) {
          console.log(`[HEALTH] ${cellId}: ${prev} → ${record.status}`);
        }
      }

      record.uptime = now - record.registeredAt;
    }
  }

  getHealth(cellId: string): CellHealthRecord | undefined {
    return this.cells.get(cellId);
  }

  getAllHealth(): CellHealthRecord[] {
    return Array.from(this.cells.values());
  }

  getHealthSummary(): { total: number; healthy: number; degraded: number; offline: number } {
    const all = this.getAllHealth();
    return {
      total: all.length,
      healthy: all.filter(c => c.status === 'HEALTHY').length,
      degraded: all.filter(c => c.status === 'DEGRADED' || c.status === 'CRITICAL').length,
      offline: all.filter(c => c.status === 'OFFLINE').length,
    };
  }
}

export const HealthMonitor = CellHealthMonitor.getInstance();
export default HealthMonitor;
