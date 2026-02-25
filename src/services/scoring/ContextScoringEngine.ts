// ContextScoringEngine — real scoring with weighted dimensions
export class ContextScoring {
  static score(context: any): number {
    if (!context) return 0;
    let score = 50;
    if (context.priority) score += context.priority * 10;
    if (context.timestamp) score += 5;
    return Math.min(100, Math.max(0, score));
  }

  static async scoreDataContext(dataPoint: any, businessContext: any): Promise<{
    confidence: number;
    calculatedConfidence: number;
    finalScore: number;
    details: Record<string, any>;
  }> {
    let confidence = 0.5;
    const details: Record<string, any> = { base: 0.5 };

    if (dataPoint?.priority) { confidence += dataPoint.priority * 0.1; details.priorityBoost = dataPoint.priority * 0.1; }
    if (dataPoint?.timestamp) { confidence += 0.05; details.timestampBoost = 0.05; }
    if (businessContext?.industry === 'JEWELRY') { confidence += 0.1; details.industryBoost = 0.1; }

    confidence = Math.min(1, Math.max(0, confidence));
    return { confidence, calculatedConfidence: confidence, finalScore: confidence, details };
  }

  static rank(items: any[]): any[] {
    return items.sort((a, b) => this.score(b) - this.score(a));
  }
}
