// ============================================================================
// src/cells/kernel/security-cell/domain/services/conflict.engine.ts
// Migrated from: services/conflict/conflict-resolver.ts
// Fixed ghost imports:
//   blockchainservice      → @/services/sharding-service
//   notificationservice    → @/services/notification-service
//   scoring/ContextScoringEngine → STUB inline (folder rỗng, không tồn tại)
// Note: ContextScoring stubbed — sẵn sàng replace khi ContextScoringEngine được build
// Migrated by Băng — 2026-03-06
// ============================================================================

import { ConflictRecord, ConflictResolutionRule } from '@/types';
import { ShardingService } from '@/services/sharding-service';
import { NotifyBus } from '@/services/notification-service';
import { PersonaID } from '@/types';

// ─── ContextScoring STUB ──────────────────────────────────────────────────────
// TODO: Replace when ContextScoringEngine is implemented
// Interface preserved để future migration không cần sửa ConflictEngine

interface ContextScore {
  confidence: number;
  dominantDomain: string;
  industryMatch: string;
}

const ContextScoring = {
  scoreContext(data: unknown, domain: string): ContextScore {
    // Stub: trả về confidence mặc định
    // Khi ContextScoringEngine ready → swap implementation này
    return {
      confidence: 0.75,
      dominantDomain: domain,
      industryMatch: 'JEWELRY_MANUFACTURING'
    };
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConflictStrategy =
  | 'LAST_WRITE_WINS'
  | 'FIRST_WRITE_WINS'
  | 'MANUAL_REVIEW'
  | 'AI_MERGE'
  | 'ROLLBACK';

export interface ConflictResolutionResult {
  conflictId: string;
  strategy: ConflictStrategy;
  resolved: boolean;
  winner?: unknown;
  requiresManualReview: boolean;
  auditHash: string;
  resolvedAt: number;
}

// ─── Conflict Engine ──────────────────────────────────────────────────────────

export class ConflictEngine {
  private static instance: ConflictEngine;

  public static getInstance(): ConflictEngine {
    if (!ConflictEngine.instance) ConflictEngine.instance = new ConflictEngine();
    return ConflictEngine.instance;
  }

  public async resolveConflicts(
    conflicts: ConflictRecord[],
    dataType: string
  ): Promise<ConflictResolutionResult[]> {
    const rule = this.loadConflictRule(dataType);
    const results: ConflictResolutionResult[] = [];

    for (const conflict of conflicts) {
      const result = await this.resolve(conflict, rule, dataType);
      results.push(result);

      if (result.requiresManualReview) {
        NotifyBus.push({
          type: 'RISK',
          title: `Conflict cần xem xét: ${dataType}`,
          content: `Conflict ${conflict.id} không thể tự động giải quyết — cần Can/Kris xem xét.`,
          persona: PersonaID.KRIS
        });
      }
    }

    return results;
  }

  private async resolve(
    conflict: ConflictRecord,
    rule: ConflictResolutionRule,
    dataType: string
  ): Promise<ConflictResolutionResult> {
    const contextScore = ContextScoring.scoreContext(conflict, dataType);
    const industry = this.mapDomainToIndustry(dataType);

    let strategy: ConflictStrategy = rule.strategy as ConflictStrategy;
    let winner: unknown = null;
    let resolved = false;

    // Confidence cao → tự động giải quyết
    if (contextScore.confidence >= 0.85) {
      switch (strategy) {
        case 'LAST_WRITE_WINS':
          winner = conflict.incoming;
          resolved = true;
          break;
        case 'FIRST_WRITE_WINS':
          winner = conflict.existing;
          resolved = true;
          break;
        case 'AI_MERGE':
          winner = this.mergeValues(conflict.existing, conflict.incoming);
          resolved = true;
          break;
        default:
          resolved = false;
      }
    }

    const auditHash = ShardingService.generateShardHash({
      conflictId: conflict.id,
      strategy,
      resolvedAt: Date.now(),
      industry
    });

    return {
      conflictId: conflict.id,
      strategy,
      resolved,
      winner,
      requiresManualReview: !resolved,
      auditHash,
      resolvedAt: Date.now()
    };
  }

  private mergeValues(existing: unknown, incoming: unknown): unknown {
    if (typeof existing === 'object' && typeof incoming === 'object') {
      return { ...existing as object, ...incoming as object };
    }
    return incoming; // Fallback: incoming wins
  }

  private mapDomainToIndustry(domain: string): string {
    const map: Record<string, string> = {
      'SALES': 'JEWELRY_RETAIL',
      'PRODUCTION': 'JEWELRY_MANUFACTURING',
      'CUSTOMS': 'IMPORT_EXPORT',
      'HR': 'HUMAN_RESOURCES',
      'FINANCE': 'FINANCIAL_ACCOUNTING'
    };
    return map[domain.toUpperCase()] || 'GENERAL';
  }

  private loadConflictRule(dataType: string): ConflictResolutionRule {
    // Rules pluggable — có thể inject từ config
    const rules: Record<string, ConflictResolutionRule> = {
      'SALES_ORDER':    { strategy: 'LAST_WRITE_WINS', priority: 1 },
      'INVENTORY':      { strategy: 'MANUAL_REVIEW',   priority: 2 },
      'EMPLOYEE':       { strategy: 'FIRST_WRITE_WINS', priority: 1 },
      'ACCOUNTING':     { strategy: 'MANUAL_REVIEW',   priority: 3 },
      'DEFAULT':        { strategy: 'LAST_WRITE_WINS', priority: 1 }
    };
    return rules[dataType.toUpperCase()] || rules['DEFAULT'];
  }
}

export const ConflictResolver = ConflictEngine.getInstance();
