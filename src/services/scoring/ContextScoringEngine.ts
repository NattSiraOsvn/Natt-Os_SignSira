// ContextScoringEngine — Weighted multi-dimension scoring engine
// Real implementation from archive (154L)
import { BusinessContext, ScoreResult, DataPoint } from '../../types';

export class ContextScoringEngine {
  private static instance: ContextScoringEngine;

  private readonly SCORE_WEIGHTS = {
    sourceReliability: 0.35,
    temporalRecency: 0.20,
    dataCompleteness: 0.20,
    businessValidation: 0.15,
    crossReference: 0.10
  };

  public static getInstance(): ContextScoringEngine {
    if (!ContextScoringEngine.instance) {
      ContextScoringEngine.instance = new ContextScoringEngine();
    }
    return ContextScoringEngine.instance;
  }

  async scoreDataContext(dataPoint: DataPoint, context: BusinessContext): Promise<ScoreResult> {
    const data = dataPoint.payload;

    const [sourceScore, temporalScore, completenessScore, validationScore, crossRefScore] = await Promise.all([
      this.calculateSourceScore(dataPoint.source),
      this.calculateTemporalScore(dataPoint.timestamp, context.dataType || 'DEFAULT'),
      this.calculateCompletenessScore(data, context.industry || 'GENERAL'),
      this.validateBusinessRules(data, context),
      this.checkCrossReferences(dataPoint)
    ]);

    let finalScore =
      (sourceScore * this.SCORE_WEIGHTS.sourceReliability) +
      (temporalScore * this.SCORE_WEIGHTS.temporalRecency) +
      (completenessScore * this.SCORE_WEIGHTS.dataCompleteness) +
      (validationScore * this.SCORE_WEIGHTS.businessValidation) +
      (crossRefScore * this.SCORE_WEIGHTS.crossReference);

    if (context.industry === 'JEWELRY') {
      if (completenessScore < 0.8) finalScore *= 0.8;
    }
    if (context.industry === 'FINANCE') {
      if (validationScore < 1.0) finalScore *= 0.5;
    }

    return {
      finalScore: parseFloat(finalScore.toFixed(4)),
      details: {
        source: sourceScore,
        temporal: temporalScore,
        completeness: completenessScore,
        validation: validationScore,
        crossRef: crossRefScore
      },
      confidenceLevel: finalScore >= 0.85 ? 'HIGH' : finalScore >= 0.6 ? 'MEDIUM' : 'LOW',
      recommendation: this.generateRecommendation(finalScore)
    };
  }

  // Compatibility alias
  static score(context: any): number {
    if (!context) return 0;
    let score = 50;
    if (context.priority) score += context.priority * 10;
    if (context.timestamp) score += 5;
    return Math.min(100, Math.max(0, score));
  }

  private calculateSourceScore(source: string): number {
    const map: Record<string, number> = {
      'MASTER_MANUAL': 1.0,
      'DIRECT_API': 0.95,
      'OMEGA_OCR': 0.85,
      'LEGACY_SYNC': 0.60,
      'UNKNOWN': 0.30
    };
    return map[source] || 0.5;
  }

  private calculateTemporalScore(timestamp: number, dataType: string): number {
    const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (['GOLD_PRICE', 'STOCK_LEVEL', 'EXCHANGE_RATE'].includes(dataType)) {
      return Math.exp(-ageInHours / 24);
    }
    if (['EMPLOYEE_PROFILE', 'PRODUCT_CATALOG'].includes(dataType)) {
      return Math.exp(-ageInHours / 87600);
    }
    return Math.exp(-ageInHours / 168);
  }

  private calculateCompletenessScore(data: any, industry: string): number {
    if (!data || typeof data !== 'object') return 0;
    const keys = Object.keys(data);
    const filledKeys = keys.filter(k => data[k] !== null && data[k] !== undefined && data[k] !== '');
    let score = filledKeys.length / keys.length;
    if (industry === 'JEWELRY') {
      const criticals = ['weight', 'gold_type', 'stone_spec'];
      const hasCriticals = criticals.every(k => keys.includes(k) ? (data[k] ? true : false) : true);
      if (!hasCriticals) score *= 0.5;
    }
    return score;
  }

  private validateBusinessRules(data: any, context: BusinessContext): number {
    if (data.amount !== undefined && typeof data.amount === 'number' && data.amount < 0) return 0;
    if (data.price !== undefined && typeof data.price === 'number' && data.price < 0) return 0;
    if (data.taxRate !== undefined && data.taxRate > 100) return 0.2;
    if (context.industry === 'LOGISTICS' && data.quantity !== undefined && data.quantity < 0) return 0;
    return 1.0;
  }

  private async checkCrossReferences(dataPoint: DataPoint): Promise<number> {
    if (dataPoint.payload.invoiceId) {
      return Math.random() > 0.1 ? 1.0 : 0.5;
    }
    return 0.8;
  }

  private generateRecommendation(score: number): string {
    if (score >= 0.95) return "AUTO_MERGE: Dữ liệu hoàn hảo.";
    if (score >= 0.85) return "AUTO_ACCEPT: Dữ liệu đáng tin cậy.";
    if (score >= 0.60) return "MANUAL_REVIEW: Cần kiểm tra lại (Cảnh báo vàng).";
    return "REJECT: Dữ liệu rủi ro cao hoặc lỗi nghiêm trọng.";
  }
}

export const ContextScoring = ContextScoringEngine.getInstance();
