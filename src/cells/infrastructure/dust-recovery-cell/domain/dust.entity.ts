/**
 * dust-recovery-cell / domain / dust.entity.ts
 * Nguồn: BUI_VANG_2025.xlsx (sheet Vật tư phụ - Vàng sau nấu)
 *
 * RULES:
 *   TR-006: Phải emit DUST_CLOSE_REPORT trước period-close
 *   TR-007: DustSubmission phải có role=SX|SC (FS-025)
 *   FS-024: Detect carry-forward (loss_rate < -20% trong 5 ngày đầu tháng)
 *   PHỔ% VH: KHÔNG hard-code – phải đo thực tế sau mỗi lần nấu
 */

import { VatTuType, WorkerRole } from '@/governance/event-contracts/production-events';

export interface DustRecord {
  id: string;
  workerId: string;
  workerName?: string;
  role: WorkerRole;
  vtType: VatTuType;
  tlGiao: number;        // TL giao (chỉ)
  tlTra: number;         // TL trả (chỉ)
  phoPct?: number;       // PHỔ% thực tế sau nấu (KHÔNG hard-code cho VH)
  quy750?: number;       // = tlTra × (phoPct / 75%) – tính ở application layer khi có phoPct
  lossRate: number;      // = (tlGiao - tlTra) / tlGiao
  periodId: string;      // YYYY-MM
  day: number;           // ngày trong tháng (để detect carry-forward)
  isCarryForward: boolean;
  adjustedFromPeriod?: string;
  lapIds?: string[];
  orderIds?: string[];
}

export interface BenchmarkRecord {
  role: WorkerRole;
  vtType: VatTuType;
  month: number;         // 1-12
  lossRateAvg: number;
  lossRateStdDev: number;
  sampleSize: number;
  updatedAt: Date;
}

/**
 * Tính DustScore – định mức hao hụt kỳ vọng.
 * Weighted: 0.6 × rolling_3m + 0.3 × global_avg + 0.1 × industry_bench
 * Dữ liệu 10 tháng BUI_VANG_2025 là industry_bench khởi tạo.
 *
 * QUAN TRỌNG: số liệu benchmark TB trong bảng là "preliminary" –
 * cần lọc carry-forward trước khi finalize.
 */
export function calculateDustScore(
  rollingAvg3m: number | null,
  globalAvg: number,
  industryBench: number,
): number {
  if (rollingAvg3m === null) {
    return 0.7 * globalAvg + 0.3 * industryBench;
  }
  return 0.6 * rollingAvg3m + 0.3 * globalAvg + 0.1 * industryBench;
}

/** Phân loại mức độ bất thường theo số σ */
export function classifyAnomaly(
  actualLoss: number,
  dustScore: number,
  stdDev: number,
): { level: 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL'; deviationSigma: number } {
  const dev = stdDev > 0 ? (actualLoss - dustScore) / stdDev : 0;
  const abs = Math.abs(dev);

  if (abs < 1) return { level: 'NORMAL', deviationSigma: dev };
  if (abs < 2) return { level: 'WARNING', deviationSigma: dev };
  if (abs < 3) return { level: 'HIGH', deviationSigma: dev };
  return { level: 'CRITICAL', deviationSigma: dev };
}

/**
 * Detect carry-forward.
 * Dấu hiệu: lossRate < -0.2 VÀ ngày ≤ 5 trong tháng.
 * → Đề xuất điều chỉnh về tháng trước, chờ Gatekeeper approve.
 */
export function detectCarryForward(record: DustRecord): boolean {
  return record.lossRate < -0.2 && record.day <= 5;
}

/** Tính quy 750 – CHỈ gọi khi đã có phoPct thực tế */
export function calculateQuy750(tlTra: number, phoPct: number): number {
  if (phoPct <= 0 || phoPct > 100) throw new Error('phoPct invalid');
  return tlTra * (phoPct / 75);
}

/** Preliminary benchmarks từ BUI_VANG_2025 – cần lọc carry-forward trước khi dùng chính thức */
export const PRELIMINARY_BENCHMARKS: Record<string, { avg: number; stdDev: number }> = {
  'SX:75CHI': { avg: 0.34, stdDev: 0.08 },   // PRELIMINARY – chưa lọc carry-forward
  'SC:75CHI': { avg: 0.20, stdDev: 0.07 },
  'SX:58.5CHI': { avg: 0.20, stdDev: 0.06 },
  'SC:58.5CHI': { avg: 0.14, stdDev: 0.05 },
  'SX:41.6CHI': { avg: 0.33, stdDev: 0.07 },
  'SC:41.6CHI': { avg: 0.22, stdDev: 0.06 },
  'SX:VH_NHE': { avg: 0.22, stdDev: 0.06 },  // PHỔ% KHÔNG hard-code – đo thực tế
  'SX:VH_NANG': { avg: 0.18, stdDev: 0.05 },
  'SX:VH_DO': { avg: 0.20, stdDev: 0.05 },
  'SX:50GIAC': { avg: 0.095, stdDev: 0.04 },
  'SX:75GIAC': { avg: 0.11, stdDev: 0.04 },
};
