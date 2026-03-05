// ============================================================================
// src/cells/kernel/audit-cell/domain/services/audit.engine.ts
// Migrated from: services/admin/audit-service.ts
// Fixed: ghost imports (.ts extension, blockchainservice, notificationservice)
// Migrated by Băng — 2026-03-06
// ============================================================================

import { ShardingService } from '@/services/sharding-service';
import { AuditItem, PersonaID } from '@/types';
import { NotifyBus } from '@/services/notification-service';

export class AuditEngine {
  private static instance: AuditEngine;
  private readonly DB_KEY = 'NATT_OS_AUDIT_LEDGER_PROD';

  public static getInstance(): AuditEngine {
    if (!AuditEngine.instance) AuditEngine.instance = new AuditEngine();
    return AuditEngine.instance;
  }

  private async getPreviousHash(): Promise<string> {
    try {
      const raw = localStorage.getItem(this.DB_KEY);
      if (!raw) return '0'.repeat(64);
      const logs: AuditItem[] = JSON.parse(raw);
      return logs.length > 0 ? (logs[logs.length - 1].hash || '0'.repeat(64)) : '0'.repeat(64);
    } catch {
      return '0'.repeat(64);
    }
  }

  public async logAction(params: {
    action: string;
    actor: string;
    module: string;
    details: string;
    severity?: 'INFO' | 'WARNING' | 'CRITICAL';
    targetId?: string;
    oldValue?: unknown;
    newValue?: unknown;
  }): Promise<AuditItem> {
    const prevHash = await this.getPreviousHash();
    const timestamp = Date.now();

    const hash = ShardingService.generateShardHash({
      ...params,
      timestamp,
      prevHash
    });

    const entry: AuditItem = {
      id: `AUDIT-${timestamp}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      timestamp,
      action: params.action,
      actor: params.actor,
      module: params.module,
      details: params.details,
      severity: params.severity || 'INFO',
      targetId: params.targetId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      hash,
      prevHash
    };

    try {
      const raw = localStorage.getItem(this.DB_KEY);
      const logs: AuditItem[] = raw ? JSON.parse(raw) : [];
      logs.push(entry);
      localStorage.setItem(this.DB_KEY, JSON.stringify(logs));
    } catch {
      console.warn('[AuditEngine] Storage full — log kept in memory only');
    }

    if (params.severity === 'CRITICAL') {
      NotifyBus.push({
        type: 'RISK',
        title: `AUDIT CRITICAL: ${params.action}`,
        content: params.details,
        persona: PersonaID.KRIS,
        priority: 'HIGH'
      });
    }

    return entry;
  }

  public async verifyChainIntegrity(): Promise<{
    valid: boolean;
    totalRecords: number;
    brokenAt?: string;
    orphans: number;
  }> {
    try {
      const raw = localStorage.getItem(this.DB_KEY);
      if (!raw) return { valid: true, totalRecords: 0, orphans: 0 };

      const logs: AuditItem[] = JSON.parse(raw);
      let orphans = 0;

      for (let i = 1; i < logs.length; i++) {
        if (logs[i].prevHash !== logs[i - 1].hash) {
          return { valid: false, totalRecords: logs.length, brokenAt: logs[i].id, orphans };
        }
        if (!logs[i].prevHash) orphans++;
      }

      return { valid: true, totalRecords: logs.length, orphans };
    } catch {
      return { valid: false, totalRecords: 0, orphans: 0 };
    }
  }

  public getLogs(): AuditItem[] {
    try {
      const raw = localStorage.getItem(this.DB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const AuditProvider = AuditEngine.getInstance();
