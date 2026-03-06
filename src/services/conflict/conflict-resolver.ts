// ConflictResolver — Pre-Quantum decision engine with context-aware scoring
// Real implementation from archive (133L) — imports fixed for goldmaster
import {
  DataPoint, ResolutionContext, ResolvedData,
  ConflictResolutionMethod, ConflictResolutionRule, BusinessContext
} from '../../types';
import { ShardingService } from '@/services/sharding-service';
import { NotifyBus } from '@/services/notification-service';
// ContextScoring inline stub
const ContextScoring = { scoreDataContext: async (_p: any, _c: any) => ({ finalScore: 0.5, details: {} }) };

export class ConflictResolver {
  private static instance: ConflictResolver;

  public static getInstance(): ConflictResolver {
    if (!ConflictResolver.instance) {
      ConflictResolver.instance = new ConflictResolver();
    }
    return ConflictResolver.instance;
  }

  public async resolveConflicts(
    dataPoints: DataPoint[],
    context: ResolutionContext
  ): Promise<ResolvedData> {

    if (dataPoints.length === 0) throw new Error("No data points to resolve");
    if (dataPoints.length === 1) {
      return {
        resolvedValue: dataPoints[0].payload,
        method: 'PRIORITY_BASED',
        confidence: dataPoints[0].confidence || 0,
        source: dataPoints[0].source || 'SINGLE',
        resolvedAt: Date.now(),
        winner: dataPoints[0],
        losers: [],
        methodUsed: ConflictResolutionMethod.PRIORITY_BASED,
        resolutionHash: await ShardingService.generateShardHash(dataPoints[0] as unknown as Record<string, unknown>),
        isAutoResolved: true
      };
    }

    const businessContext: BusinessContext = {
      module: 'CONFLICT_RESOLVER',
      operation: 'RESOLVE',
      actor: 'SYSTEM',
      timestamp: Date.now(),
      industry: this.mapDomainToIndustry(context.businessType || 'GENERAL'),
      region: 'VN',
      priority: 'NORMAL',
      dataType: context.businessType || 'GENERAL'
    };

    const scoredPoints = await Promise.all(dataPoints.map(async (p) => {
      const scoreResult = await ContextScoring.scoreDataContext(p, businessContext);
      return {
      strategy: 'last-write-wins' as const,
        ...p,
        calculatedConfidence: scoreResult.finalScore,
        scoreDetails: scoreResult.details
      };
    }));

    scoredPoints.sort((a, b) => (b.calculatedConfidence || 0) - (a.calculatedConfidence || 0));
    const winner = scoredPoints[0];
    const confidenceGap = (winner.calculatedConfidence || 0) - (scoredPoints[1]?.calculatedConfidence || 0);

    const rule = this.loadConflictRule(context.businessType || 'GENERAL');
    let methodUsed = rule.defaultMethod || rule.method;

    if (confidenceGap >= (rule.threshold || 0.3)) {
      methodUsed = ConflictResolutionMethod.PRIORITY_BASED;
    } else if (rule.fallbackMethod === ConflictResolutionMethod.TIMESTAMP_BASED) {
      scoredPoints.sort((a, b) => b.timestamp - a.timestamp);
      methodUsed = ConflictResolutionMethod.TIMESTAMP_BASED;
    } else {
      methodUsed = ConflictResolutionMethod.MANUAL_REVIEW;
      NotifyBus.push({
        type: 'RISK',
        title: 'Xung đột dữ liệu cần xem xét',
        content: `Xung đột tại ${context.businessType || 'UNKNOWN'}. Gap: ${(confidenceGap * 100).toFixed(1)}%. Winner Score: ${winner.calculatedConfidence}`,
        persona: 'KRIS'
      });
    }

    return {
      resolvedValue: scoredPoints[0].payload,
      method: String(methodUsed),
      confidence: scoredPoints[0].calculatedConfidence || 0,
      source: scoredPoints[0].source || 'SCORED',
      resolvedAt: Date.now(),
      winner: scoredPoints[0],
      losers: scoredPoints.slice(1),
      methodUsed: String(methodUsed),
      resolutionHash: await ShardingService.generateShardHash({ winner: scoredPoints[0].id, context }),
      isAutoResolved: methodUsed !== ConflictResolutionMethod.MANUAL_REVIEW
    };
  }

  private mapDomainToIndustry(domain: string): string {
    const map: Record<string, string> = {
      'JEWELRY': 'JEWELRY', 'GOLD': 'JEWELRY', 'DIAMOND': 'JEWELRY',
      'FINANCE': 'FINANCE', 'TAX': 'FINANCE', 'ACCOUNTING': 'FINANCE',
      'LOGISTICS': 'LOGISTICS', 'WAREHOUSE': 'LOGISTICS',
    };
    return map[domain] || 'GENERAL';
  }

  private loadConflictRule(dataType: string): ConflictResolutionRule {
    return {
      strategy: 'last-write-wins' as const,
      id: `RULE-${dataType}`,
      name: `${dataType} Resolution Rule`,
      priority: 1,
      condition: 'default',
      method: ConflictResolutionMethod.PRIORITY_BASED,
      dataType: dataType,
      threshold: 0.3,
      defaultMethod: ConflictResolutionMethod.PRIORITY_BASED,
      fallbackMethod: ConflictResolutionMethod.MANUAL_REVIEW
    };
  }
}

export const ConflictEngine = ConflictResolver.getInstance();
