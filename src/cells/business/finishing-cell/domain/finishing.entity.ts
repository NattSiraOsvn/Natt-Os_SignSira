export interface finishingEntity { id: string; cellId: "finishing-cell"; createdAt: Date; updatedAt: Date; }


// ── Stub types — pending full implementation ──
export type FinishingStatus = 'pending' | 'in_progress' | 'quality_check' | 'completed' | 'rejected';

export interface FinishingRecord {
  id: string;
  orderId: string;
  status: FinishingStatus;
  startedAt: Date;
  completedAt?: Date;
  worker?: string;
  notes?: string;
}

export interface WorkerAssignment {
  workerId: string;
  recordId: string;
  assignedAt: Date;
  task: string;
}

export interface DustIssue {
  id: string;
  recordId: string;
  weight: number;
  type: 'gold' | 'silver' | 'platinum';
  collectedAt: Date;
}

export function createDustIssue(params: Partial<DustIssue>): DustIssue {
  return {
    id: params.id ?? 'dust_' + Date.now(),
    recordId: params.recordId ?? '',
    weight: params.weight ?? 0,
    type: params.type ?? 'gold',
    collectedAt: params.collectedAt ?? new Date(),
  };
}
