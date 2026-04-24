/**
 * polishing-cell — domain/polishing.entity.ts
 * Sprint 2 | Tâm Luxury natt-os
 * Subscribe: WIP_STONE → Emit: WIP_COMPLETED
 */

export type PolishingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'failED';

export interface PolishingRecord {
  id:           string;
  lapId:        string;
  orderId:      string;
  workerId:     string;
  weightDaTam:  number;
  weightDaChu:  number;
  weightVang:   number;
  weightTP:     number;
  qcApproved:   boolean;
  status:       PolishingStatus;
  startedAt:    Date;
  completedAt?: Date;
  note?:        string;
}

export function createPolishingRecord(
  lapId:       string,
  orderId:     string,
  workerId:    string,
  weightDaTam: number,
  weightDaChu: number,
): PolishingRecord {
  return {
    id:         `POL-${lapId}-${Date.now()}`,
    lapId,
    orderId,
    workerId,
    weightDaTam,
    weightDaChu,
    weightVang:  0,
    weightTP:    0,
    qcApproved:  false,
    status:      'PENDING',
    startedAt:   new Date(),
  };
}

export function completePolishing(
  record:     PolishingRecord,
  weightVang: number,
): void {
  record.weightVang   = weightVang;
  record.weightTP     = weightVang + record.weightDaTam + record.weightDaChu;
  record.qcApproved   = true;
  record.status       = 'COMPLETED';
  record.completedAt  = new Date();
}
