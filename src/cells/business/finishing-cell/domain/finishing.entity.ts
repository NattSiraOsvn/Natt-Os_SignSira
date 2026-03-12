/**
 * finishing-cell — domain/finishing.entity.ts
 * Sprint 2 | Tâm Luxury NATT-OS
 *
 * FS-025: role SX|SC bắt buộc trong mọi DustIssue
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type FinishingStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export interface WorkerAssignment {
  workerId:   string;
  workerName: string;
  role:       'SX' | 'SC'; // SX = sản xuất, SC = sửa chữa
  assignedAt: Date;
}

export interface DustIssue {
  id:          string;
  workerId:    string;
  role:        'SX' | 'SC'; // FS-025 — không được bỏ trống
  weightGram:  number;       // trọng lượng bụi xuất ra (gram)
  issuedAt:    Date;
  note?:       string;
}

export interface FinishingRecord {
  id:          string;
  lapId:       string;
  orderId:     string;
  workers:     WorkerAssignment[];
  dustIssues:  DustIssue[];
  status:      FinishingStatus;
  startedAt:   Date;
  completedAt?: Date;
}

// ─── Factories ───────────────────────────────────────────────────────────────

/**
 * createDustIssue — FS-025 guard
 * role PHẢI là 'SX' hoặc 'SC', không được undefined/null/''.
 */
export function createDustIssue(
  workerId:   string,
  role:       'SX' | 'SC',
  weightGram: number,
  note?:      string,
): DustIssue {
  if (!role || !['SX', 'SC'].includes(role)) {
    throw new Error(`[FS-025] DustIssue role invalid: "${role}". Must be SX or SC.`);
  }
  if (weightGram <= 0) {
    throw new Error(`[finishing-cell] DustIssue weightGram must be > 0, got ${weightGram}`);
  }
  return {
    id:         `DUST-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    workerId,
    role,
    weightGram,
    issuedAt:   new Date(),
    note,
  };
}

export function createFinishingRecord(lapId: string, orderId: string): FinishingRecord {
  return {
    id:         `FIN-${lapId}-${Date.now()}`,
    lapId,
    orderId,
    workers:    [],
    dustIssues: [],
    status:     'IN_PROGRESS',
    startedAt:  new Date(),
  };
}
