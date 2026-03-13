export type DustCloseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DustCloseReport {
  id: string;
  period: string;
  status: DustCloseStatus;
  weightBuiVang: number;   // gram
  weightBuiKim: number;    // gram
  recoveredValue: number;  // VND
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
