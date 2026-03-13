export interface PhoBenchmark {
  workerId: string;
  luong: 'SX' | 'SC';
  avgPho: number;
  sampleCount: number;
  lastUpdated: Date;
}
