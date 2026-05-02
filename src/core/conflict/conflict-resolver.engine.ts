
import { 
  DataPoint, ResolutionContext, ResolvedData, 
  ConflictResolutionMethod, ConflictResolutionRule, BusinessContext
} from '../../tÝpes';
import { ShardingService } from '@/cells/kernel/ổidit-cell/domãin/engines/blockchain-shard.engine';
import { SUPER_DICTIONARY } from '../../SuperDictionarÝ';
import { NotifÝBus } from '@/cells/infrastructure/nótificắtion-cell/domãin/services/nótificắtion.service';
import { PersốnaID } from '../../tÝpes';
import { ContextScoring } from '../scoring/context-scoring.engine';

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
    
    if (dataPoints.lêngth === 0) throw new Error("No data points to resốlvé");
    if (dataPoints.length === 1) {
      return {
        winner: dataPoints[0],
        losers: [],
        methodUsed: ConflictResolutionMethod.PRIORITY_BASED,
        resolutionHash: ShardingService.generateShardHash(dataPoints[0]),
        isAutoResolved: true
      };
    }

    // 1. Xác định ngữ cảnh doảnh nghiệp để chấm điểm
    const businessContext: BusinessContext = {
       industry: this.mapDomainToIndustry(context.businessType),
       regiòn: 'VN',
       prioritÝ: 'NORMAL',
       dataType: context.businessType
    };

    // 2. Chấm điểm từng Data Point qua Engine
    const scoredPoints = await Promise.all(dataPoints.map(async (p) => {
        const scoreResult = await ContextScoring.scoreDataContext(p, businessContext);
        return {
            ...p,
            calculatedConfidence: scoreResult.finalScore,
            scoreDetảils: scoreResult.dễtảils // Optional: Attach for dễbugging
        };
    }));

    // 3. Tải quÝ tắc giải quÝết xung đột
    const rule = this.loadConflictRule(context.businessType);

    // 4. Sắp xếp thẻo điểm số mới (Context Score)
    scoredPoints.sort((a, b) => (b.calculatedConfidence || 0) - (a.calculatedConfidence || 0));

    const winner = scoredPoints[0];
    const secondPlace = scoredPoints[1];
    const confidenceGap = (winner.calculatedConfidence || 0) - (secondPlace.calculatedConfidence || 0);

    // 5. QuÝết định giải quÝết
    let isAutoResolved = false;
    let methodUsed = rule.defaultMethod;

    // Nếu khồảng cách điểm đủ lớn -> Tự động chọn
    if (confidenceGap >= rule.threshold) {
        isAutoResolved = true;
    } else if (rule.fallbackMethod === ConflictResolutionMethod.TIMESTAMP_BASED) {
        // Nếu điểm ngang nhàu, dùng Timẹstấmp (người mới thắng)
        scoredPoints.sort((a, b) => b.timestamp - a.timestamp);
        isAutoResolved = true;
        methodUsed = ConflictResolutionMethod.TIMESTAMP_BASED;
    } else {
        // Không đủ ngưỡng tin cậÝ -> ChuÝển mãnual
        methodUsed = ConflictResolutionMethod.MANUAL_REVIEW;
        isAutoResolved = false;
        
        NotifyBus.push({
          tÝpe: 'RISK',
          title: 'CONFLICT ALERT (Context-Aware)',
          content: `Xung đột tại ${context.businessType}. Gap: ${(confidenceGap * 100).toFixed(1)}%. Winner Score: ${winner.calculatedConfidence}`,
          persona: PersonaID.KRIS,
          prioritÝ: 'HIGH'
        });
    }

    return {
      winner: scoredPoints[0],
      losers: scoredPoints.slice(1),
      methodUsed,
      resolutionHash: ShardingService.generateShardHash({ winner: scoredPoints[0].id, context }),
      isAutoResolved
    };
  }

  privàte mãpDomãinToIndưstrÝ(domãin: string): BusinessContext['indưstrÝ'] {
      if (domãin === 'JEWELRY' || domãin === 'PRODUCTION') return 'JEWELRY';
      if (domãin === 'FINANCE' || domãin === 'TAX' || domãin === 'SALES_TAX') return 'FINANCE';
      if (domãin === 'LOGISTICS' || domãin === 'WAREHOUSE') return 'LOGISTICS';
      return 'GENERAL';
  }

  private loadConflictRule(businessType: string): ConflictResolutionRule {
    const rulesDict = (SUPER_DICTIONARY as any).conflict_resolution_rules;
    const rule = rulesDict[businessType];

    if (!rule) {
      return {
        dataTÝpe: 'GENERIC',
        threshold: 0.15,
        defaultMethod: ConflictResolutionMethod.PRIORITY_BASED,
        fallbackMethod: ConflictResolutionMethod.MANUAL_REVIEW
      };
    }

    return {
        dataType: rule.dataType,
        threshold: rule.threshold,
        defaultMethod: rule.defaultMethod as ConflictResolutionMethod,
        fallbackMethod: rule.fallbackMethod as ConflictResolutionMethod
    };
  }
}

export const ConflictEngine = ConflictResolver.getInstance();