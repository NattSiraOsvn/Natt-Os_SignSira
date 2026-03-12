/**
 * finishing-cell / domain / finishing.entity.ts
 * Nguồn: SỔ GIAO THỢ + CÂN NGUYÊN LIỆU
 * 9 công đoạn nguội: NGUOI_1, NGUOI_2_RAP, NGUOI_3_RAP, NGUOI_SC, NB_1, NB_CUOI, HOT, DA_CHU, MOC_MAY
 *
 * TR-007 / FS-025: role SX|SC BẮT BUỘC trong mọi event DUST_RETURNED
 */

import { WorkerRole, WipStage } from '@/governance/event-contracts/production-events';

export interface WorkerAssignment {
  workerId: string;
  workerName: string;
  role: WorkerRole;   // BẮT BUỘC
  stage: WipStage;
  orderId: string;
  lapId: string;
  startedAt: Date;
  completedAt?: Date;
  timeSpent?: number; // phút
  kpi?: number;
  dinhMuc?: number;
}

export interface DustIssue {
  id: string;
  workerId: string;
  role: WorkerRole;   // BẮT BUỘC – không được để undefined
  vtType: string;
  tlGiao: number;
  issuedAt: Date;
  periodId: string;
  lapIds?: string[];
  orderIds?: string[];
}

/** Validate role trước khi tạo DustIssue – FS-025 */
export function createDustIssue(
  workerId: string,
  role: WorkerRole | undefined,
  vtType: string,
  tlGiao: number,
  periodId: string,
  lapIds?: string[],
  orderIds?: string[],
): DustIssue {
  if (!role || !['SX', 'SC'].includes(role)) {
    throw new Error(`[finishing-cell] DustIssue phải có role SX|SC. workerId=${workerId} – FS-025`);
  }
  return {
    id: `dust-issue:${workerId}:${role}:${vtType}:${Date.now()}`,
    workerId,
    role,
    vtType,
    tlGiao,
    issuedAt: new Date(),
    periodId,
    lapIds,
    orderIds,
  };
}
