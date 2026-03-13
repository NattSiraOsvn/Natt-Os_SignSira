export type VtType = 'NHẸ' | 'NẶNG' | 'ĐỎ';
export type DustCloseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Old types — dùng bởi dust.engine.ts
export interface DustRecord {
  id: string;
  workerId: string;
  workerName: string;
  role: string;
  vtType: VtType;
  periodId: string;
  weightGross: number;
  weightNet: number;
  recoveredVND: number;
  createdAt: Date;
}

export interface BenchmarkRecord {
  role: string;
  vtType: VtType;
  month: number;
  avgWeightNet: number;
  stdDev: number;
  sampleCount: number;
}

// New types — dùng bởi period-close-cell
export interface DustCloseReport {
  id: string;
  period: string;
  status: DustCloseStatus;
  weightBuiVang: number;
  weightBuiKim: number;
  recoveredValue: number;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  createdBy: string;
}

export function createDustCloseReport(
  period: string,
  weightBuiVang: number,
  weightBuiKim: number,
  createdBy: string
): DustCloseReport {
  return {
    id: `DCR_${period}_${Date.now()}`,
    period,
    status: 'PENDING',
    weightBuiVang,
    weightBuiKim,
    recoveredValue: 0,
    createdAt: new Date(),
    createdBy
  };
}
