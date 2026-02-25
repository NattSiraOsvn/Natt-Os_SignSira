
import { DataPoint, ResolutionContext, ResolvedData, ConflictResolutionMethod, ConflictResolutionRule, BusinessContext } from '../../types';
import { ShardingService } from '../blockchainservice';
// 🛠️ Fixed: Changed import casing to match superdictionary.ts
// Changed SUPER_DICTIONARY to superdictionary
import { SuperDictionary } from '../../superdictionary';
const superdictionary = SuperDictionary.getInstance();
import { NotifyBus } from '../notificationservice';
import { PersonaID } from '../../types';
import { ContextScoring } from '../scoring/ContextScoringEngine';

export class ConflictResolver {
  private static instance: ConflictResolver;

  public static getInstance(): ConflictResolver {
    if (!ConflictResolver.instance) {
      ConflictResolver.instance = new ConflictResolver();
    }
    return ConflictResolver.instance;
  }

  /**
   * Giải quyết xung đột giữa các DataPoints sử dụng Context-Aware Scoring
   */
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
        source: dataPoints[0].source || 'UNKNOWN',
        resolvedAt: Date.now(),
        winner: dataPoints[0],
        losers: [],
        methodUsed: ConflictResolutionMethod.PRIORITY_BASED,
        resolutionHash: await ShardingService.generateShardHash(dataPoints[0]),
        isAutoResolved: true
      };
    }

    // 1. Xác định ngữ cảnh doanh nghiệp để chấm điểm
    const businessContext: BusinessContext = {
       module: 'CONFLICT_RESOLVER',
       operation: 'RESOLVE',
       actor: 'SYSTEM',
       timestamp: Date.now(),
       industry: this.mapDomainToIndustry(context.businessType),
       region: 'VN',
       priority: 'NORMAL',
       dataType: context.businessType
    };

    // 2. Chấm điểm từng Data Point qua Engine
    const scoredPoints = await Promise.all(dataPoints.map(async (p) => {
        const scoreResult = await ContextScoring.scoreDataContext(p, businessContext);
        return {
            ...p,
            calculatedConfidence: scoreResult.finalScore,
            scoreDetails: scoreResult.details // Optional: Attach for debugging
        };
    }));

    // 3. Tải quy tắc giải quyết xung đột
    const rule = this.loadConflictRule(context.businessType);

    // 4. Sắp xếp theo điểm số mới (Context Score)
    scoredPoints.sort((a, b) => (b.calculatedConfidence || 0) - (a.calculatedConfidence || 0));

    const winner = scoredPoints[0];
    const secondPlace = scoredPoints[1];
    const confidenceGap = (winner.calculatedConfidence || 0) - (secondPlace.calculatedConfidence || 0);

    // 5. Quyết định giải quyết
    let isAutoResolved = false;
    let methodUsed = rule.defaultMethod;

    // Nếu khoảng cách điểm đủ lớn -> Tự động chọn
    if (confidenceGap >= rule.threshold) {
        isAutoResolved = true;
    } else if (rule.fallbackMethod === ConflictResolutionMethod.TIMESTAMP_BASED) {
        // Nếu điểm ngang nhau, dùng Timestamp (người mới thắng)
        scoredPoints.sort((a, b) => b.timestamp - a.timestamp);
        isAutoResolved = true;
        methodUsed = ConflictResolutionMethod.TIMESTAMP_BASED;
    } else {
        // Không đủ ngưỡng tin cậy -> Chuyển manual
        methodUsed = ConflictResolutionMethod.MANUAL_REVIEW;
        isAutoResolved = false;
        
        NotifyBus.push({
          type: 'RISK',
          title: 'CONFLICT ALERT (Context-Aware)',
          content: `Xung đột tại ${context.businessType}. Gap: ${(confidenceGap * 100).toFixed(1)}%. Winner Score: ${winner.calculatedConfidence}`,
          persona: PersonaID.KRIS,
          priority: 'HIGH'
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
      methodUsed,
      resolutionHash: await ShardingService.generateShardHash({ winner: scoredPoints[0].id, context }),
      isAutoResolved
    };
  }

  private mapDomainToIndustry(domain: string): BusinessContext['industry'] {
      if (domain === 'JEWELRY' || domain === 'PRODUCTION') return 'JEWELRY';
      if (domain === 'FINANCE' || domain === 'TAX' || domain === 'SALES_TAX') return 'FINANCE';
      if (domain === 'LOGISTICS' || domain === 'WAREHOUSE') return 'LOGISTICS';
      return 'GENERAL';
  }

  private loadConflictRule(businessType: string): ConflictResolutionRule {
    // FIX: Usage of superdictionary (lowercase)
    const rulesDict = (superdictionary as any).conflict_resolution_rules;
    const rule = rulesDict[businessType];

    if (!rule) {
      return {
        id: 'RULE-GENERIC',
        name: 'Generic Resolution',
        priority: 1,
        condition: 'default',
        method: ConflictResolutionMethod.PRIORITY_BASED,
        dataType: 'GENERIC',
        threshold: 0.15,
        defaultMethod: ConflictResolutionMethod.PRIORITY_BASED,
        fallbackMethod: ConflictResolutionMethod.MANUAL_REVIEW
      };
    }

    return {
        id: rule.id || 'RULE-CUSTOM',
        name: rule.name || 'Custom Rule',
        priority: rule.priority || 1,
        condition: rule.condition || 'custom',
        method: rule.method || rule.defaultMethod,
        dataType: rule.dataType,
        threshold: rule.threshold,
        defaultMethod: rule.defaultMethod as ConflictResolutionMethod,
        fallbackMethod: rule.fallbackMethod as ConflictResolutionMethod
    };
  }
}

export const ConflictEngine = ConflictResolver.getInstance();
