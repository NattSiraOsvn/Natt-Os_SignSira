// @ts-nocheck
import { DataFetcher } from '../interfaces/data.fetcher';

export interface BehaviorAnomaly {
  personaId: string;
  type: 'DEFENSIVE_CONTRACTION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  metrics: {
    before: any;
    after: any;
    dropRate: number;
  };
  evidence: any[];
}

export async function detectBehaviorAnomaly(fetcher: DataFetcher): Promise<BehaviorAnomaly[]> {
  // Lấy danh sách các sự kiện phê bình (có thể từ governance)
  const criticismEvents = await fetcher.fetchCriticismEvents(7); // 7 ngày gần nhất
  const anomalies: BehaviorAnomaly[] = [];

  for (const event of criticismEvents) {
    const personaId = event.personaId;
    const before = await fetcher.fetchPersonaMetrics(personaId, event.timestamp - 24*3600*1000, event.timestamp);
    const after = await fetcher.fetchPersonaMetrics(personaId, event.timestamp, event.timestamp + 24*3600*1000);

    // Tính độ giảm
    const dropOutput = before.avgOutputLength ? (after.avgOutputLength / before.avgOutputLength) : 1;
    const dropNovelty = before.noveltyScore ? (after.noveltyScore / before.noveltyScore) : 1;
    const increaseError = before.errorRate ? (after.errorRate / before.errorRate) : 1;

    if (dropOutput < 0.7 && dropNovelty < 0.7 && increaseError > 1.3) {
      anomalies.push({
        personaId,
        type: 'DEFENSIVE_CONTRACTION',
        severity: dropOutput < 0.5 ? 'HIGH' : 'MEDIUM',
        metrics: { before, after, dropRate: 1 - dropOutput },
        evidence: [event]
      });
    }
  }

  return anomalies;
}